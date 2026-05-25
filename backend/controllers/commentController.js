import Comment from "../models/CommentModel.js";
import Post from "../models/PostModel.js";
import { createNotification } from "./notificationController.js";

// Get all comments for a specific post
export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId })
      .populate("userId", "username _id")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ comments });
  } catch (error) {
    console.error("Error fetching post comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

// Add a comment to a post
export const addComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { postId, content } = req.body;

    if (!userId || !postId || !content?.trim()) {
      return res
        .status(400)
        .json({ message: "userId, postId, and content are required" });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create comment
    const comment = await Comment.create({
      postId,
      userId,
      content: content.trim(),
    });

    // Populate user info
    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "username _id")
      .lean();

    // Create notification if comment is not from post author
    if (post.userId.toString() !== userId) {
      await createNotification(
        post.userId,
        userId,
        "post_comment",
        "New comment on your dream",
        `Someone commented on your dream: "${content.substring(0, 50)}..."`,
        postId
      );
    }

    res.status(201).json({ comment: populatedComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author of the comment
    if (comment.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own comments" });
    }

    await Comment.findByIdAndDelete(commentId);

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author
    if (comment.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own comments" });
    }

    comment.content = content.trim();
    await comment.save();

    const updatedComment = await Comment.findById(commentId)
      .populate("userId", "username _id")
      .lean();

    res.json({ comment: updatedComment });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Failed to update comment" });
  }
};

// Get comment count for a post
export const getCommentCount = async (req, res) => {
  try {
    const { postId } = req.params;

    const count = await Comment.countDocuments({ postId });

    res.json({ postId, count });
  } catch (error) {
    console.error("Error getting comment count:", error);
    res.status(500).json({ message: "Failed to get comment count" });
  }
};
