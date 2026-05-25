import express from "express";
import { protect, authenticateToken } from "../middleware/authMiddleware.js";
import {
  getUserStats,
  getUserProfile,
  searchUsers,
} from "../controllers/userController.js";

const router = express.Router();

// Search users by username (facebook-like)
router.get("/search", searchUsers);

// Get user statistics
router.get("/:userId/stats", protect, getUserStats);

// Get basic user profile information by ID
router.get("/:userId", protect, getUserProfile);

// Note: Friend request endpoints live in friendRoutes.js

export default router;

