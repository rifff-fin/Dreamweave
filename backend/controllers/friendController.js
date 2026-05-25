import FriendRequestModel from "../models/FriendRequestModel.js";
import UserModel from "../models/UserModel.js";
import PostModel from "../models/PostModel.js";
import { createNotification } from "./notificationController.js";

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user?.id || req.body.senderId;

    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "senderId and receiverId are required" });
    }

    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ message: "Cannot send friend request to yourself" });
    }

    // Check if receiver exists
    const receiver = await UserModel.findById(receiverId);
    const sender = await UserModel.findById(senderId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Check if request already exists
    const existingRequest = await FriendRequestModel.findOne({
      $or: [
        { senderId, receiverId, status: "pending" },
        { senderId: receiverId, receiverId: senderId, status: "pending" },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    // Check if already friends
    const existingFriendship = await FriendRequestModel.findOne({
      $or: [
        { senderId, receiverId, status: "accepted" },
        { senderId: receiverId, receiverId: senderId, status: "accepted" },
      ],
    });

    if (existingFriendship) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Create friend request
    const friendRequest = await FriendRequestModel.create({
      senderId,
      receiverId,
      status: "pending",
    });

    // Create notification
    await createNotification(
      receiverId,
      senderId,
      "friend_request",
      "New Friend Request",
      `${sender?.username || "Someone"} sent you a friend request!`,
      friendRequest._id,
    );

    res.status(201).json({
      message: "Friend request sent",
      friendRequest,
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: error.message });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const friendRequest = await FriendRequestModel.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.receiverId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this request" });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    const sender = await UserModel.findById(friendRequest.senderId);
    const receiver = await UserModel.findById(userId);

    friendRequest.status = "accepted";
    await friendRequest.save();

    // Update friend counts
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { totalFriends: 1 },
    });
    await UserModel.findByIdAndUpdate(friendRequest.senderId, {
      $inc: { totalFriends: 1 },
    });

    // Create notification for sender
    await createNotification(
      friendRequest.senderId,
      userId,
      "friend_accept",
      "Friend Request Accepted",
      `${receiver?.username || "Someone"} accepted your friend request!`,
      friendRequest._id,
    );

    res.json({
      message: "Friend request accepted",
      friendRequest,
    });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: error.message });
  }
};

// Reject a friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const friendRequest = await FriendRequestModel.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.receiverId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this request" });
    }

    if (friendRequest.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    friendRequest.status = "rejected";
    await friendRequest.save();

    res.json({
      message: "Friend request rejected",
      friendRequest,
    });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ message: error.message });
  }
};

// Remove a friend
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (userId === friendId) {
      return res.status(400).json({ message: "Cannot remove yourself as a friend" });
    }

    // Treat `friendId` as the other user's id.
    // Friendship is stored as an accepted FriendRequest in either direction.
    const result = await FriendRequestModel.findOneAndDelete({
      $or: [
        { senderId: userId, receiverId: friendId, status: "accepted" },
        { senderId: friendId, receiverId: userId, status: "accepted" },
      ],
    });


    if (!result) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    res.json({
      message: "Friend removed successfully",
      friendRequest: result,
    });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get pending friend requests for a user
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.params.userId;

    const pendingRequests = await FriendRequestModel.find({
      receiverId: userId,
      status: "pending",
    })
      .populate("senderId", "username")
      .lean();

    res.json(pendingRequests);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get friendship status between the current user and a target user
export const getFriendshipStatus = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const targetUserId = req.params.targetUserId;

    if (!currentUserId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (currentUserId === targetUserId) {
      return res.json({ status: "self" });
    }

    const accepted = await FriendRequestModel.findOne({
      $or: [
        {
          senderId: currentUserId,
          receiverId: targetUserId,
          status: "accepted",
        },
        {
          senderId: targetUserId,
          receiverId: currentUserId,
          status: "accepted",
        },
      ],
    });

    if (accepted) {
      return res.json({ status: "friends" });
    }

    const sent = await FriendRequestModel.findOne({
      senderId: currentUserId,
      receiverId: targetUserId,
      status: "pending",
    });

    if (sent) {
      return res.json({ status: "sent", requestId: sent._id });
    }

    const received = await FriendRequestModel.findOne({
      senderId: targetUserId,
      receiverId: currentUserId,
      status: "pending",
    });

    if (received) {
      return res.json({ status: "received", requestId: received._id });
    }

    res.json({ status: "none" });
  } catch (error) {
    console.error("Error fetching friendship status:", error);
    res.status(500).json({ message: "Failed to fetch friendship status" });
  }
};

// Get user's friends list
export const getUserFriends = async (req, res) => {
  try {
    const userId = req.params.userId;

    const accepted = await FriendRequestModel.find({
      status: "accepted",
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).lean();

    // IMPORTANT: normalize ObjectId comparisons using toString()
    const friendIds = accepted
      .map((r) => {
        const sender = r.senderId?.toString?.() ?? String(r.senderId);
        const receiver = r.receiverId?.toString?.() ?? String(r.receiverId);
        const me = userId.toString();
        if (sender === me) return receiver;
        if (receiver === me) return sender;
        return null;
      })
      .filter(Boolean);

    // remove self if any bad data exists
    const normalizedFriendIds = friendIds.filter((id) => id !== userId.toString());

    // De-duplicate
    const uniqueFriendIds = [...new Set(normalizedFriendIds)];

    const friends = await UserModel.find({ _id: { $in: uniqueFriendIds } })
      .select("username streakCount")
      .lean();

    const friendsWithStats = await Promise.all(
      friends.map(async (friend) => {
        const visionsCount = await PostModel.countDocuments({
          userId: friend._id,
        });
        return {
          _id: friend._id,
          username: friend.username,
          streakCount: friend.streakCount || 0,
          visionsCount,
        };
      })
    );

    res.json(friendsWithStats);
  } catch (error) {
    console.error("Error fetching user friends:", error);
    res.status(500).json({ message: "Failed to fetch friends" });
  }
};

