
import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import { AuthContext } from '@/context/AuthContext';

const reactions = [
  { type: 'haunt', emoji: '👁️', label: 'Haunting' },
  { type: 'relate', emoji: '🌙', label: 'I relate' },
  { type: 'fear', emoji: '💀', label: 'Terrifying' },
  { type: 'lucid', emoji: '✨', label: 'Lucid' },
  { type: 'myth', emoji: '🔮', label: 'Mythical' },
];

interface ReactionButtonsProps {
  postId: string;
}

const ReactionButtons = ({ postId }: ReactionButtonsProps) => {
  const { user } = useContext(AuthContext);
  const [counts, setCounts] = useState<Record<string, number>>({
    haunt: 0,
    relate: 0,
    fear: 0,
    lucid: 0,
    myth: 0,
  });
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadReactions = async () => {
      try {
        // Get reaction counts
        const statsResponse = await api.reactions.getPostReactions(postId);
        if (statsResponse?.reactionCounts) {
          setCounts(statsResponse.reactionCounts);
        }

        // Get user's reaction
        if (user?.id) {
          const userReactionResponse = await api.reactions.getUserReaction(postId);
          if (userReactionResponse?.reaction) {
            setUserReaction(userReactionResponse.reaction.reactionType);
          }
        }
      } catch (error) {
        console.error('Failed to load reactions:', error);
      }
    };

    loadReactions();
  }, [postId, user?.id]);

  const handleReact = async (type: string) => {
    if (!user?.id || loading) return;

    setLoading(true);
    try {
      if (userReaction === type) {
        // Remove reaction
        await api.reactions.removeReaction(postId);
        setUserReaction(null);
        setCounts((prev) => ({
          ...prev,
          [type]: Math.max(0, prev[type] - 1),
        }));
      } else {
        // Add or update reaction
        await api.reactions.addReaction(postId, type);
        const oldReaction = userReaction;
        if (oldReaction) {
          setCounts((prev) => ({
            ...prev,
            [oldReaction]: Math.max(0, prev[oldReaction] - 1),
          }));
        }
        setUserReaction(type);
        setCounts((prev) => ({
          ...prev,
          [type]: prev[type] + 1,
        }));
      }
    } catch (error) {
      console.error('Failed to update reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {reactions.map(({ type, emoji, label }) => (
        <motion.button
          key={type}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleReact(type)}
          disabled={loading}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all ${
            userReaction === type
              ? 'border-primary/25 bg-primary/8 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/15 hover:text-foreground'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={label}
        >
          <span>{emoji}</span>
          <span>{counts[type]}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default ReactionButtons;
