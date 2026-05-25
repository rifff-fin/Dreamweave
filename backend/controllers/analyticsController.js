import {
  getTrendingTags,
  getSharedDreams,
  getLocationAnalytics,
  getCategoryTrends,
  getLucidDreamPatterns,
} from "../utils/patternDetector.js";
import Post from "../models/PostModel.js";
import ReactionModel from "../models/ReactionModel.js";

// Get trending tags
export const getTrendingTagsAnalytics = async (req, res) => {
  try {
    const timeWindow = req.query.timeWindow || 7;
    const trendingTags = await getTrendingTags(parseInt(timeWindow));

    res.json({ trendingTags, timeWindow });
  } catch (error) {
    console.error("Error fetching trending tags:", error);
    res.status(500).json({ message: "Failed to fetch trending tags" });
  }
};

// Get shared dreams
export const getSharedDreamsAnalytics = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const sharedDreams = await getSharedDreams(parseInt(limit));

    res.json({ sharedDreams });
  } catch (error) {
    console.error("Error fetching shared dreams:", error);
    res.status(500).json({ message: "Failed to fetch shared dreams" });
  }
};

// Get location heatmap data
export const getLocationHeatmap = async (req, res) => {
  try {
    const locationStats = await getLocationAnalytics();

    res.json({ locationStats });
  } catch (error) {
    console.error("Error fetching location heatmap:", error);
    res.status(500).json({ message: "Failed to fetch location heatmap" });
  }
};

// Get dream trend chart data
export const getDreamTrends = async (req, res) => {
  try {
    const timeWindow = req.query.timeWindow || 7;
    const days = parseInt(timeWindow);

    // Get daily post counts
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyStats = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: "published",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({ dailyStats, timeWindow });
  } catch (error) {
    console.error("Error fetching dream trends:", error);
    res.status(500).json({ message: "Failed to fetch dream trends" });
  }
};

// Get category distribution
export const getCategoryDistribution = async (req, res) => {
  try {
    const categoryTrends = await getCategoryTrends();

    res.json({ categoryTrends });
  } catch (error) {
    console.error("Error fetching category distribution:", error);
    res.status(500).json({ message: "Failed to fetch category distribution" });
  }
};

// Get lucid dream analytics
export const getLucidAnalytics = async (req, res) => {
  try {
    const patterns = await getLucidDreamPatterns();

    res.json({ patterns });
  } catch (error) {
    console.error("Error fetching lucid analytics:", error);
    res.status(500).json({ message: "Failed to fetch lucid analytics" });
  }
};

// Get overall analytics dashboard
export const getAnalyticsDashboard = async (req, res) => {
  try {
    const trendingTags = await getTrendingTags(7);
    const sharedDreams = await getSharedDreams(5);
    const locationStats = await getLocationAnalytics();
    const categoryTrends = await getCategoryTrends(7);

    // Get top posts by reactions
    const topPosts = await Post.aggregate([
      {
        $match: { status: "published" },
      },
      {
        $lookup: {
          from: "reactions",
          localField: "_id",
          foreignField: "postId",
          as: "reactions",
        },
      },
      {
        $addFields: {
          reactionCount: { $size: "$reactions" },
        },
      },
      {
        $sort: { reactionCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Get total stats
    const totalPosts = await Post.countDocuments({ status: "published" });
    const totalReactions = await ReactionModel.countDocuments();

    res.json({
      totalPosts,
      totalReactions,
      trendingTags: trendingTags.slice(0, 10),
      sharedDreams,
      locationStats: locationStats.slice(0, 5),
      categoryTrends,
      topPosts: topPosts.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching analytics dashboard:", error);
    res.status(500).json({ message: "Failed to fetch analytics dashboard" });
  }
};
