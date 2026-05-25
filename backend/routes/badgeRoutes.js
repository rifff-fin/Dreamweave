import express from "express";
import {
  getUserBadges,
  checkAllBadges,
} from "../controllers/badgeController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get badges for a user
router.get("/user/:userId", getUserBadges);

// Check and award eligible badges
router.post("/check", authenticateToken, checkAllBadges);

export default router;
