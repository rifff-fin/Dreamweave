// Purpose: Shared dream detections panel.

import { motion } from 'framer-motion';
import { Eye, Users, MapPin, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { SharedDream } from '@/types/noctis';

const SharedDreamPanel = () => {
  const [dreams, setDreams] = useState<(SharedDream & { theme: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDreams = async () => {
      try {
        const data = await api.analytics.getSharedDreams(5);
        setDreams(data.sharedDreams || []);
      } catch (error) {
        console.error('Failed to fetch shared dreams:', error);
        setDreams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDreams();
  }, []);

  return (
    <div className="noctis-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Eye className="h-4 w-4 text-destructive/60" />
        <h3 className="text-sm font-heading font-medium">Shared Dream Detections</h3>
      </div>

      {isLoading ? (
        <div className="text-xs text-muted-foreground">Loading shared dreams...</div>
      ) : dreams.length === 0 ? (
        <div className="text-xs text-muted-foreground">No shared dreams detected yet</div>
      ) : (
        <div className="space-y-3">
          {dreams.map((dream, i) => (
            <motion.div
              key={dream._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-lg border border-border p-4 hover:border-destructive/15 transition-colors"
            >
              <p className="text-sm font-medium text-foreground mb-2">{dream.theme || dream.title || 'Shared Dream'}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {dream.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{dream.city}{dream.area ? `, ${dream.area}` : ''}</span>}
                {dream.userCount && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{dream.userCount} dreamers</span>}
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(dream.detectedTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedDreamPanel;
