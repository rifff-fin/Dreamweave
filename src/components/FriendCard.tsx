
import { motion } from 'framer-motion';
import { User, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FriendCardProps {
  friendId: string;
  username: string;
  streakCount: number;
  visionsCount: number;
  index?: number;
  onRemove?: () => void;
  onChat?: () => void;
}

const FriendCard = ({
  friendId,
  username,
  streakCount,
  visionsCount,
  index = 0,
  onRemove,
  onChat,
}: FriendCardProps) => {
  return (
    <motion.div

      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3 hover:border-primary/15 transition-colors"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <User className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{username}</p>
        <p className="text-xs text-muted-foreground">{visionsCount} dreams · {streakCount}🔥</p>
      </div>
      <div className="flex gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          aria-label={`Chat with ${username}`}
          onClick={onChat}
        >
          <MessageCircle className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label={`Remove ${username} from friends`}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

    </motion.div>
  );
};

export default FriendCard;
