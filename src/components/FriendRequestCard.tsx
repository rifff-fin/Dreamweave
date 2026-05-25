
import { motion } from 'framer-motion';
import { User, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FriendRequestCardProps {
  username: string;
  requestDate: string;
  index?: number;
  onAccept?: () => void;
  onReject?: () => void;
}

const FriendRequestCard = ({ username, requestDate, index = 0, onAccept, onReject }: FriendRequestCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <User className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{username}</p>
        <p className="text-xs text-muted-foreground">{requestDate}</p>
      </div>
      <div className="flex gap-1.5">
        <Button size="sm" onClick={onAccept} className="h-7 rounded-full bg-primary/10 text-primary text-xs hover:bg-primary/20 border-0">
          <Check className="h-3 w-3 mr-1" /> Accept
        </Button>
        <Button size="sm" variant="ghost" onClick={onReject} className="h-7 rounded-full text-muted-foreground hover:text-destructive text-xs">
          <X className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
};

export default FriendRequestCard;
