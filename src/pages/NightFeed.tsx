import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PostCard from "@/components/PostCard";
import { api } from "@/services/api";
import type { Post } from "@/types/noctis";

const trendingTags = [
  "shadow-figure",
  "lucid",
  "water",
  "falling",
  "cathedral",
  "mechanical",
  "omen",
];

const NightFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      // Fetch public feed first (or friends feed if user is authenticated)
      const data = await api.posts.getPublicFeed();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch feed posts:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    const onDreamSubmitted = () => {
      fetchPosts();
    };

    window.addEventListener("dreamSubmitted", onDreamSubmitted);
    return () => window.removeEventListener("dreamSubmitted", onDreamSubmitted);
  }, []);

  return (
    <div className="min-h-screen bg-starfield pt-14">
      <main className="container mx-auto max-w-5xl px-4 py-8 page-enter">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main feed */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-heading font-semibold mb-1">
                Night Feed
              </h1>
              <p className="text-sm text-muted-foreground">
                Recent dreams and experiences
              </p>
            </motion.div>

            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">
                Loading feed...
              </div>
            ) : posts.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No dreams yet. Be the first to share!
              </div>
            ) : (
              posts.map((post, i) => (
                <PostCard key={post._id} post={post} index={i} />
              ))
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-4">
            <div className="noctis-card p-4">
              <h3 className="text-sm font-heading font-medium mb-3">
                Trending Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {trendingTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground hover:text-primary hover:border-primary/20 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default NightFeed;
