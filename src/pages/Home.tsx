
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Moon, Eye, PenTool, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Eye, title: 'Night Feed', desc: 'Browse dreams from around the world' },
  { icon: PenTool, title: 'Submit', desc: 'Share your dreams and experiences' },
  { icon: Users, title: 'Connect', desc: 'Find others with shared visions' },
  { icon: BarChart3, title: 'Analytics', desc: 'Discover patterns in dreams' },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-starfield pt-16">
      {/* Hero */}
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg"
        >
          <Moon className="mx-auto mb-6 h-10 w-10 text-primary/60" />

          <h1 className="mb-3 font-heading text-5xl md:text-6xl tracking-[0.12em] font-semibold">
            NOCTIS
          </h1>

          <p className="mx-auto mb-8 max-w-md text-base leading-relaxed text-muted-foreground">
            A quiet place for dreams, myths, and the unexplained.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button asChild className="btn-primary h-10 px-6 text-sm font-medium rounded-full">
              <Link to="/feed">
                <Eye className="mr-2 h-4 w-4" />
                Browse Feed
              </Link>
            </Button>
            <Button asChild className="btn-outline h-10 px-6 text-sm font-medium rounded-full">
              <Link to="/submit">
                <PenTool className="mr-2 h-4 w-4" />
                Share a Dream
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 flex gap-12 text-center"
        >
          {[
            { label: 'Dreams Shared', value: '2,847' },
            { label: 'Dreamers', value: '412' },
            { label: 'Shared Dreams', value: '23' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-heading font-semibold text-foreground">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="noctis-card p-5"
              >
                <feat.icon className="h-5 w-5 text-primary/50 mb-3" />
                <h3 className="text-sm font-heading font-medium mb-1">{feat.title}</h3>
                <p className="text-sm text-muted-foreground">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
