import express from "express";
import {
  getPostComments,
  addComment,
  deleteComment,
  updateComment,
  getCommentCount,
} from "../controllers/commentController.js";
import { protect as authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all comments for a post
router.get("/post/:postId", getPostComments);

// Get comment count for a post
router.get("/post/:postId/count", getCommentCount);

// Add a comment (requires auth)
router.post("/", authMiddleware, addComment);

// Update a comment (requires auth)
router.put("/:commentId", authMiddleware, updateComment);

// Delete a comment (requires auth)
router.delete("/:commentId", authMiddleware, deleteComment);

export default router;
