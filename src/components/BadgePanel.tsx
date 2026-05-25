
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { Badge } from '@/types/noctis';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const badgeEmojis: Record<string, string> = {
  first_post: '🔮',
  streak_7: '🦉',
  lucid_10: '✨',
  shared_dream: '🌀',
  streak_30: '🕳️',
  myth_5: '📜',
};

const BadgePanel = () => {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserBadges = async () => {
      if (!user?.badges) {
        setIsLoading(false);
        return;
      }

      try {
        // temporary
        const badges: Badge[] = user.badges.map((badgeName, index) => ({
          _id: `badge_${index}`,
          badgeName: badgeName,
          description: `Earned the ${badgeName} badge`,
          criteria: badgeName.toLowerCase().replace(/\s+/g, '_')
        }));

        setUserBadges(badges);
      } catch (error) {
        console.error('Failed to fetch user badges:', error);
        setUserBadges([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBadges();
  }, [user]);

  if (isLoading) {
    return (
      <div className="noctis-card p-5">
        <h3 className="mb-4 text-sm font-heading font-medium">Badges</h3>
        <div className="text-center text-muted-foreground text-sm">Loading badges...</div>
      </div>
    );
  }

  if (userBadges.length === 0) {
    return (
      <div className="noctis-card p-5">
        <h3 className="mb-4 text-sm font-heading font-medium">Badges</h3>
        <div className="text-center text-muted-foreground text-sm">No badges earned yet</div>
      </div>
    );
  }

  return (
    <div className="noctis-card p-5">
      <h3 className="mb-4 text-sm font-heading font-medium">Badges</h3>
      <div className="grid grid-cols-2 gap-2">
        {userBadges.map((badge, i) => (
          <motion.div
            key={badge._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center rounded-lg border border-border bg-secondary/50 p-3 text-center hover:border-primary/15 transition-colors"
          >
            <span className="mb-1 text-xl">{badgeEmojis[badge.criteria] || '🏆'}</span>
            <span className="text-xs font-medium text-foreground">{badge.badgeName}</span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">{badge.description}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BadgePanel;
