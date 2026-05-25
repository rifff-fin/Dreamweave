import UserModel from "../models/UserModel.js";
import PostModel from "../models/PostModel.js";
import FriendRequestModel from "../models/FriendRequestModel.js";

// Search users by username (case-insensitive, partial match)
// GET /api/users/search?q=...
export const searchUsers = async (req, res) => {
  try {
    const qRaw = req.query.q;
    const q = typeof qRaw === "string" ? qRaw.trim() : "";

    if (q.length < 1) {
      return res.json({ users: [] });
    }

    const users = await UserModel.find({
      username: { $regex: q, $options: "i" },
    })
      .select("username")
      .limit(20)
      .lean();

    res.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId;

    const dreamsCount = await PostModel.countDocuments({ userId });

    const friendsCount = await FriendRequestModel.countDocuments({
      $or: [
        { senderId: userId, status: "accepted" },
        { receiverId: userId, status: "accepted" },
      ],
    });

    const viewsCount = 0;

    res.json({
      dreamsCount,
      friendsCount,
      viewsCount,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Failed to fetch user statistics" });
  }
};

// Get basic user profile information by ID
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await UserModel.findById(userId)
      .select("username role streakCount createdAt")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

