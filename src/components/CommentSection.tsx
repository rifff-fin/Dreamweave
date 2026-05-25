import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Trash2, Send, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/services/api";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface Comment {
  _id: string;
  content: string;
  userId: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface CommentSectionProps {
  postId: string;
  expanded?: boolean;
}

const CommentSection = ({ postId, expanded = false }: CommentSectionProps) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(expanded);

  useEffect(() => {
    if (isExpanded) {
      loadComments();
    }
  }, [isExpanded, postId]);

  const loadComments = async () => {
    try {
      const response = await api.comments.getPostComments(postId);
      setComments(response.comments || []);
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user?.id || loading) return;

    setLoading(true);
    try {
      const response = await api.comments.addComment(postId, newComment.trim());
      setComments((prev) => [response.comment, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.comments.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-3"
      >
        {isExpanded ? "Hide" : "Show"} Comments ({comments.length})
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Add Comment */}
            {user?.id && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted/50">
                  <User className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && newComment.trim()) {
                        handleAddComment();
                      }
                    }}
                    className="flex-1 rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={loading}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || loading}
                    className="rounded-lg bg-primary/20 text-primary hover:bg-primary/30 px-2.5 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send comment"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-2 rounded-lg bg-muted/30 p-3"
                  >
                    <Link
                      to={`/profile/${comment.userId._id}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background/50 hover:border-primary/50 transition-colors flex-shrink-0"
                      title={`Visit ${comment.userId.username}'s profile`}
                    >
                      <User className="h-2.5 w-2.5 text-muted-foreground" />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          to={`/profile/${comment.userId._id}`}
                          className="text-xs font-semibold text-foreground hover:text-primary transition-colors truncate"
                        >
                          {comment.userId.username}
                        </Link>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 break-words">
                        {comment.content}
                      </p>
                    </div>

                    {/* Delete button - only for comment author */}
                    {user?.id === comment.userId._id && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="ml-1 text-muted-foreground hover:text-red-400 transition-colors flex-shrink-0"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommentSection;
