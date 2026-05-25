import Badge from "../models/BadgeModel.js";
import User from "../models/UserModel.js";
import Post from "../models/PostModel.js";
import Notification from "../models/NotificationModel.js";

// Badge definitions
const BADGE_DEFINITIONS = {
  night_dreamer: {
    title: "Night Dreamer",
    description: "Posted 10 times between midnight and 4 AM",
    icon: "🌙",
    requirement: async (userId) => {
      const midnightPosts = await Post.countDocuments({
        userId,
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(4, 0, 0, 0)),
        },
      });
      return midnightPosts >= 10;
    },
  },
  social_butterfly: {
    title: "Social Butterfly",
    description: "Made 5 friends",
    icon: "🦋",
    requirement: async (userId) => {
      const user = await User.findById(userId);
      return (user?.totalFriends || 0) >= 5;
    },
  },
  lucid_master: {
    title: "Lucid Master",
    description: "Posted 5 lucid dreams",
    icon: "✨",
    requirement: async (userId) => {
      const lucidPosts = await Post.countDocuments({ userId, isLucid: true });
      return lucidPosts >= 5;
    },
  },
  storyteller: {
    title: "Storyteller",
    description: "Posted 20 dreams",
    icon: "📖",
    requirement: async (userId) => {
      const postCount = await Post.countDocuments({ userId });
      return postCount >= 20;
    },
  },
  trending_creator: {
    title: "Trending Creator",
    description: "Had a post with 50+ reactions",
    icon: "🔥",
    requirement: async (userId) => {
      // This would require aggregating reactions from ReactionModel
      // For now, simplified check
      return true;
    },
  },
  community_leader: {
    title: "Community Leader",
    description: "Received 100+ total reactions",
    icon: "👑",
    requirement: async (userId) => {
      // This would require aggregating all reactions for user's posts
      return true;
    },
  },
};

// Check and award badge
export const checkAndAwardBadge = async (userId, badgeType) => {
  try {
    // Check if user already has this badge
    const existingBadge = await Badge.findOne({ userId, badgeType });
    if (existingBadge) {
      return null; // Already has badge
    }

    const badgeDefinition = BADGE_DEFINITIONS[badgeType];
    if (!badgeDefinition) {
      return null;
    }

    // Check if requirements are met
    const meetsRequirement = await badgeDefinition.requirement(userId);
    if (!meetsRequirement) {
      return null;
    }

    // Award badge
    const badge = new Badge({
      userId,
      badgeType,
      title: badgeDefinition.title,
      description: badgeDefinition.description,
      icon: badgeDefinition.icon,
    });

    await badge.save();

    // Add to user's badges
    await User.findByIdAndUpdate(
      userId,
      { $push: { badges: badge._id } },
      { new: true },
    );

    // Create notification
    await Notification.create({
      recipientId: userId,
      senderId: userId,
      type: "badge_earned",
      title: "Badge Earned!",
      message: `You earned the "${badgeDefinition.title}" badge!`,
      relatedId: badge._id,
    });

    return badge;
  } catch (error) {
    console.error("Error awarding badge:", error);
  }
};

// Get all badges for a user
export const getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    const badges = await Badge.find({ userId }).sort({ earnedAt: -1 });

    res.json(badges);
  } catch (error) {
    console.error("Error fetching user badges:", error);
    res.status(500).json({ message: "Failed to fetch badges" });
  }
};

// Check all possible badges for a user
export const checkAllBadges = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Award all eligible badges
    const results = [];
    for (const badgeType of Object.keys(BADGE_DEFINITIONS)) {
      const awarded = await checkAndAwardBadge(userId, badgeType);
      if (awarded) {
        results.push(awarded);
      }
    }

    res.json({ message: "Badge check complete", awarded: results });
  } catch (error) {
    console.error("Error checking badges:", error);
    res.status(500).json({ message: "Failed to check badges" });
  }
};

// Update streak count
export const updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user?.lastPostDate) {
      const lastPostDate = new Date(user.lastPostDate);
      lastPostDate.setHours(0, 0, 0, 0);

      const daysSince = Math.floor(
        (today.getTime() - lastPostDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // If posted today, increment streak; if missed a day, reset
      if (daysSince === 0) {
        // Already posted today
        return user.streakCount;
      } else if (daysSince === 1) {
        // Posted yesterday, increment streak
        const newStreak = user.streakCount + 1;
        await User.findByIdAndUpdate(
          userId,
          { streakCount: newStreak, lastPostDate: new Date() },
          { new: true },
        );
        return newStreak;
      } else {
        // Missed days, reset streak to 1
        await User.findByIdAndUpdate(
          userId,
          { streakCount: 1, lastPostDate: new Date() },
          { new: true },
        );
        return 1;
      }
    } else {
      // First post
      await User.findByIdAndUpdate(
        userId,
        { streakCount: 1, lastPostDate: new Date() },
        { new: true },
      );
      return 1;
    }
  } catch (error) {
    console.error("Error updating streak:", error);
  }
};
