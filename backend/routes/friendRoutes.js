import express from "express";
import {
  getUserFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getPendingRequests,
  getFriendshipStatus,
} from "../controllers/friendController.js";
import { protect, authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user's friends list
router.get("/user/:userId", protect, getUserFriends);

// Get pending friend requests for a user
router.get("/requests/:userId", protect, getPendingRequests);

// Get friendship status with a target user
router.get("/status/:targetUserId", authenticateToken, getFriendshipStatus);

// Send friend request
router.post("/request/send", authenticateToken, sendFriendRequest);

// Accept friend request
router.put(
  "/request/:requestId/accept",
  authenticateToken,
  acceptFriendRequest,
);

// Reject friend request
router.put(
  "/request/:requestId/reject",
  authenticateToken,
  rejectFriendRequest,
);

// Remove friend
router.delete("/:friendId", authenticateToken, removeFriend);

export default router;
