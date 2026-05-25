
import { motion } from 'framer-motion';
import DreamTrendChart from '@/components/analytics/DreamTrendChart';
import LocationHeatmap from '@/components/analytics/LocationHeatmap';
import SharedDreamPanel from '@/components/analytics/SharedDreamPanel';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-starfield pt-14">
      <main className="container mx-auto max-w-5xl px-4 py-8 page-enter">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="text-2xl font-heading font-semibold mb-1">Analytics</h1>
          <p className="text-sm text-muted-foreground">Patterns in the collective unconscious</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <DreamTrendChart />
          <LocationHeatmap />
          <div className="md:col-span-2">
            <SharedDreamPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
