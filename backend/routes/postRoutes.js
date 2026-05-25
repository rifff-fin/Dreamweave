import express from "express";
import {
  createPost,
  getPosts,
  getPublicFeed,
  getFriendsFeed,
  getUserPosts,
} from "../controllers/postController.js";
import { protect, authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", getPosts);
router.get("/feed/public", getPublicFeed);
router.get("/feed/friends", authenticateToken, getFriendsFeed);
router.get("/user/:userId", getUserPosts);

export default router;
