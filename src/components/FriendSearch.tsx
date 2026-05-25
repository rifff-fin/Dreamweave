import { useState, useEffect, useContext } from "react";
import { Search, UserPlus, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const FriendSearch = ({ onFriendAdded }: { onFriendAdded?: () => void }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ _id: string; username: string }>>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  // Keep debounced/controlled but still responsive (no stale searches)
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const q = query.trim();
      if (q.length < 2) {
        if (!cancelled) setResults([]);
        return;
      }

      try {
        const data = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
        const users = (data?.users ?? data ?? []) as Array<{ _id: string; username: string }>;
        if (!cancelled) setResults(users);
      } catch (error) {
        console.error("Error searching users:", error);
        if (!cancelled) setResults([]);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleSendRequest = async (userId: string, username: string) => {
    try {
      setSending(userId);
      await api.friends.sendFriendRequest(userId);
      setSentRequests(new Set([...sentRequests, userId]));
      setTimeout(() => {
        onFriendAdded?.();
      }, 300);
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Failed to send friend request");
    } finally {
      setSending(null);
    }
  };

  const handleGoProfile = (targetUserId: string) => {
    navigate(`/profile/${targetUserId}`);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username..."
          className="pl-9 border-border bg-secondary"
        />
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((u, i) => {
            const isSelf = user?.id && u._id === user.id;
            return (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3 gap-2"
              >
                <button
                  type="button"
                  className="flex min-w-0 items-center gap-2 text-left"
                  onClick={() => handleGoProfile(u._id)}
                  disabled={isSelf}
                  aria-label={`Open profile of ${u.username}`}
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/8">
                    <User className="h-3.5 w-3.5 text-primary/70" />
                  </span>
                  <span className="text-sm text-foreground truncate">{u.username}</span>
                </button>

                <Button
                  size="sm"
                  disabled={isSelf || sending === u._id || sentRequests.has(u._id)}
                  className="h-7 rounded-full bg-primary/10 text-primary text-xs hover:bg-primary/20 border-0 disabled:opacity-50"
                  onClick={() => handleSendRequest(u._id, u.username)}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  {sentRequests.has(u._id) ? "Sent" : isSelf ? "You" : "Add"}
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}

      {query && results.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-3">No users found</p>
      )}
    </div>
  );
};

// (named export) keeping compatibility if some imports use named export
export { FriendSearch };

export default FriendSearch;

