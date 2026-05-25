import express from "express";
import {
  addReaction,
  getPostReactions,
  getUserReaction,
  removeReaction,
  getReactionStats,
} from "../controllers/reactionController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST: Add or update a reaction
router.post("/", authenticateToken, addReaction);

// GET: Get all reactions for a specific post
router.get("/post/:postId", getPostReactions);

// GET: Get user's reaction on a specific post
router.get("/post/:postId/user", authenticateToken, getUserReaction);

// DELETE: Remove a reaction
router.delete("/post/:postId", authenticateToken, removeReaction);

// POST: Get reaction stats for multiple posts
router.post("/stats", getReactionStats);

export default router;
