// Purpose: Trending dream symbols — clean bar chart.

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';

const DreamTrendChart = () => {
  const [trendingTags, setTrendingTags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const data = await api.analytics.getTrendingTags(7);
        setTrendingTags(data.trendingTags || []);
      } catch (error) {
        console.error('Failed to fetch trending tags:', error);
        setTrendingTags([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, []);

  const maxCount = trendingTags.length > 0 ? Math.max(...trendingTags.map(t => t.count || 0)) : 100;

  return (
    <div className="noctis-card p-5 h-full">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary/50" />
        <h3 className="text-sm font-heading font-medium">Trending Symbols</h3>
      </div>
      {isLoading ? (
        <div className="text-xs text-muted-foreground">Loading trends...</div>
      ) : trendingTags.length === 0 ? (
        <div className="text-xs text-muted-foreground">No trend data available yet</div>
      ) : (
        <div className="space-y-3">
          {trendingTags.slice(0, 7).map((trend, i) => (
            <div key={trend._id || trend.tag || i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{trend.tag || trend.symbol}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{trend.count}</span>
                </div>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(trend.count / maxCount) * 100}%` }}
                  transition={{ delay: 0.15 + i * 0.04, duration: 0.5 }}
                  className="h-full rounded-full bg-primary/40"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DreamTrendChart;
