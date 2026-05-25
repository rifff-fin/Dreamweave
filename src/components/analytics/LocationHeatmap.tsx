// Purpose: Dream activity by location — clean list.

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';

const LocationHeatmap = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await api.analytics.getLocationHeatmap();
        setLocations(data.locationStats || []);
      } catch (error) {
        console.error('Failed to fetch location heatmap:', error);
        setLocations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const getIntensity = (count: number, maxCount: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.6) return 'high';
    if (ratio > 0.3) return 'medium';
    return 'low';
  };

  const maxCount = locations.length > 0 ? Math.max(...locations.map(l => l.count || 0)) : 100;

  return (
    <div className="noctis-card p-5 h-full">
      <div className="mb-4 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary/50" />
        <h3 className="text-sm font-heading font-medium">Dream Hotspots</h3>
      </div>
      {isLoading ? (
        <div className="text-xs text-muted-foreground">Loading locations...</div>
      ) : locations.length === 0 ? (
        <div className="text-xs text-muted-foreground">No location data available yet</div>
      ) : (
        <div className="space-y-1.5">
          {locations.slice(0, 6).map((loc, i) => {
            const intensity = getIntensity(loc.count || 0, maxCount);
            return (
              <motion.div
                key={`${loc.city}-${loc.area}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${intensity === 'high' ? 'bg-primary' : intensity === 'medium' ? 'bg-primary/50' : 'bg-primary/25'}`} />
                  <span className="text-foreground">{loc.city}{loc.area ? `, ${loc.area}` : ''}</span>
                </div>
                <span className="text-xs text-muted-foreground">{loc.count || 0}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LocationHeatmap;
