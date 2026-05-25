
import { motion } from 'framer-motion';
import DreamForm from '@/components/DreamForm';

const SubmitDream = () => {
  return (
    <div className="min-h-screen bg-starfield pt-14">
      <main className="container mx-auto max-w-xl px-4 py-8 page-enter">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <h1 className="text-2xl font-heading font-semibold mb-1">Share a Dream</h1>
          <p className="text-sm text-muted-foreground">Describe what you experienced</p>
        </motion.div>

        <div className="noctis-card p-6">
          <DreamForm />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          🌙 Submissions open 12:00 AM – 4:00 AM
        </p>
      </main>
    </div>
  );
};

export default SubmitDream;
