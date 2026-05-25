import Reaction from "../models/ReactionModel.js";
import Post from "../models/PostModel.js";
import { createNotification } from "./notificationController.js";

// Add or update a reaction on a post
export const addReaction = async (req, res) => {
  try {
    const { postId, reactionType } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId || !postId || !reactionType) {
      return res.status(400).json({
        message: "userId, postId, and reactionType are required",
      });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if reaction already exists
    const existingReaction = await Reaction.findOne({ userId, postId });

    if (existingReaction) {
      // Update existing reaction
      existingReaction.reactionType = reactionType;
      await existingReaction.save();
      res.json({
        message: "Reaction updated",
        reaction: existingReaction,
      });
    } else {
      // Create new reaction
      const reaction = await Reaction.create({
        userId,
        postId,
        reactionType,
      });

      if (post.userId.toString() !== userId) {
        await createNotification(
          post.userId,
          userId,
          "post_reaction",
          "New reaction on your dream",
          `${req.user?.username || "Someone"} reacted to your dream.`,
          postId,
        );
      }

      res.status(201).json({
        message: "Reaction added",
        reaction,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reactions for a specific post
export const getPostReactions = async (req, res) => {
  try {
    const { postId } = req.params;

    const reactions = await Reaction.find({ postId })
      .populate("userId", "username")
      .lean();

    // Count reactions by type
    const reactionCounts = {
      haunt: 0,
      relate: 0,
      fear: 0,
      lucid: 0,
      myth: 0,
    };

    reactions.forEach((reaction) => {
      reactionCounts[reaction.reactionType]++;
    });

    res.json({
      postId,
      totalReactions: reactions.length,
      reactionCounts,
      reactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific user's reaction on a post
export const getUserReaction = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const reaction = await Reaction.findOne({ userId, postId });

    if (!reaction) {
      return res.json({ message: "No reaction found", reaction: null });
    }

    res.json({ reaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a reaction from a post
export const removeReaction = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const reaction = await Reaction.findOneAndDelete({ userId, postId });

    if (!reaction) {
      return res.status(404).json({ message: "Reaction not found" });
    }

    res.json({
      message: "Reaction removed",
      reaction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reaction counts for multiple posts
export const getReactionStats = async (req, res) => {
  try {
    const { postIds } = req.body;

    if (!postIds || !Array.isArray(postIds)) {
      return res.status(400).json({
        message: "postIds array is required",
      });
    }

    const stats = {};

    for (const postId of postIds) {
      const reactions = await Reaction.find({ postId }).lean();

      const reactionCounts = {
        haunt: 0,
        relate: 0,
        fear: 0,
        lucid: 0,
        myth: 0,
      };

      reactions.forEach((reaction) => {
        reactionCounts[reaction.reactionType]++;
      });

      stats[postId] = {
        totalReactions: reactions.length,
        reactionCounts,
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
