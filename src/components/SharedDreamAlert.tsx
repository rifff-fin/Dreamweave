

import { motion } from 'framer-motion';
import { AlertTriangle, Users, MapPin, Clock } from 'lucide-react';

interface SharedDreamAlertProps {
  theme: string;
  location: string;
  userCount: number;
  timeWindow: string;
}

const SharedDreamAlert = ({ theme, location, userCount, timeWindow }: SharedDreamAlertProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="noctis-card overflow-hidden border-destructive/15"
    >
      <div className="px-4 py-2.5 border-b border-destructive/10 bg-destructive/5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          <span className="text-xs font-medium text-destructive">Shared Dream Detected</span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-sm font-medium text-foreground">{theme}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{userCount} dreamers</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeWindow}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SharedDreamAlert;
