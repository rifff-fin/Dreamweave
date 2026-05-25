import Post from "../models/PostModel.js";
import User from "../models/UserModel.js";
import { updateStreak, checkAndAwardBadge } from "./badgeController.js";

// Check if current time is within midnight window (12:00 AM - 4:00 AM)
// FOR DEVELOPMENT: Disabled time restriction - set to always true
const isNightmodeWindow = () => {
  // Development mode: always allow posting
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const now = new Date();
  const hours = now.getHours();
  // Allow posting between 00:00 (midnight) and 03:59 (before 4:00 AM)
  return hours >= 0 && hours < 4;
};

export const createPost = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const postData = {
      ...req.body,
      userId,
      authorName:
        req.user?.username ||
        req.body.authorName ||
        (req.body.userId
          ? await User.findById(req.body.userId)
              .then((u) => u?.username)
              .catch(() => null)
          : null) ||
        "Unknown",
      location:
        req.body.location ||
        `${req.body.city || ""}${req.body.city && req.body.area ? ", " : ""}${req.body.area || ""}`,
      city: req.body.city || req.body.division || null,
      area: req.body.area || req.body.location || null,
    };

    // Check if posting is within midnight window
    if (!isNightmodeWindow()) {
      // Queue the post for later publication (set to pending)
      postData.status = "queued";
      postData.scheduledPublishTime = getNextNightmodeWindow();
    } else {
      // Publish immediately if within midnight window
      postData.status = "published";
    }

    const post = await Post.create(postData);

    // Update streak and total posts count
    if (userId) {
      await updateStreak(userId);
      await User.findByIdAndUpdate(userId, { $inc: { totalPosts: 1 } });

      // Check badges
      await checkAndAwardBadge(userId, "night_dreamer");
      await checkAndAwardBadge(userId, "storyteller");
      if (postData.isLucid) {
        await checkAndAwardBadge(userId, "lucid_master");
      }
    }

    res.status(201).json({
      ...post.toObject(),
      message:
        postData.status === "queued"
          ? `Your post will be published during the next midnight window (${postData.scheduledPublishTime.toLocaleTimeString()})`
          : "Post published successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Calculate the next midnight window start time (00:00 - 04:00)
const getNextNightmodeWindow = () => {
  const now = new Date();
  const nextMidnight = new Date(now);

  if (now.getHours() >= 4) {
    // If after 4:00 AM, next window is tomorrow at midnight
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
  } else {
    // If before midnight, next window is tonight at midnight
    nextMidnight.setHours(0, 0, 0, 0);
    if (nextMidnight <= now) {
      // Already past midnight today, so it's tomorrow
      nextMidnight.setDate(nextMidnight.getDate() + 1);
    }
  }

  return nextMidnight;
};

export const getPosts = async (req, res) => {
  try {
    // Development mode: show all posts, production: show only published
    const query =
      process.env.NODE_ENV === "production" ? { status: "published" } : {}; // Show all posts in dev

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "username")
      .lean();

    const enriched = posts.map((post) => ({
      ...post,
      authorName: post.authorName || post.userId?.username || "Anonymous",
      city: post.city || post.division || "Unknown",
      area: post.area || post.location || "Unknown",
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get public feed (only public posts)
export const getPublicFeed = async (req, res) => {
  try {
    const posts = await Post.find({ status: "published", visibility: "public" })
      .sort({ createdAt: -1 })
      .populate("userId", "username")
      .lean();

    const enriched = posts.map((post) => ({
      ...post,
      authorName: post.authorName || post.userId?.username || "Anonymous",
      city: post.city || post.division || "Unknown",
      area: post.area || post.location || "Unknown",
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get friends feed (public + friends-only posts that user can see)
export const getFriendsFeed = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Get user's friends
    const FriendRequest = require("../models/FriendRequestModel.js").default;
    const friendRequests = await FriendRequest.find({
      $or: [
        { senderId: userId, status: "accepted" },
        { receiverId: userId, status: "accepted" },
      ],
    }).lean();

    const friendIds = friendRequests.map((request) =>
      request.senderId === userId ? request.receiverId : request.senderId,
    );

    // Get posts that are either public or from friends
    const posts = await Post.find({
      status: "published",
      $or: [
        { visibility: "public" },
        { visibility: "friends", userId: { $in: friendIds } },
        { visibility: "anonymous" }, // Anonymous posts visible to everyone
      ],
    })
      .sort({ createdAt: -1 })
      .populate("userId", "username")
      .lean();

    const enriched = posts.map((post) => ({
      ...post,
      authorName:
        post.visibility === "anonymous"
          ? "Anonymous"
          : post.authorName || post.userId?.username || "Unknown",
      city: post.city || post.division || "Unknown",
      area: post.area || post.location || "Unknown",
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's own posts (including queued ones)
export const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId;

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "username")
      .lean();

    const enriched = posts.map((post) => ({
      ...post,
      authorName: post.authorName || post.userId?.username || "Anonymous",
      city: post.city || post.division || "Unknown",
      area: post.area || post.location || "Unknown",
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
