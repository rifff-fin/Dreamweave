import Post from "../models/PostModel.js";

// Calculate trending tags based on frequency and recency
export const getTrendingTags = async (timeWindowDays = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeWindowDays);

    // Aggregate posts to count tag occurrences
    const tagStats = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: "published",
        },
      },
      {
        $unwind: "$tags",
      },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
          lastUsed: { $max: "$createdAt" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    return tagStats.map((stat) => ({
      tag: stat._id,
      count: stat.count,
      trending: stat.count > 5,
      lastUsed: stat.lastUsed,
    }));
  } catch (error) {
    console.error("Error getting trending tags:", error);
    return [];
  }
};

// Detect shared dreams (similar themes/locations/times)
export const getSharedDreams = async (limit = 10) => {
  try {
    // Find posts with common themes in the same time period
    const sharedDreams = await Post.aggregate([
      {
        $match: {
          status: "published",
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            category: "$category",
            city: "$city",
          },
          count: { $sum: 1 },
          posts: { $push: "$_id" },
          avgTime: { $avg: "$timestamp" },
        },
      },
      {
        $match: {
          count: { $gt: 2 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    return sharedDreams;
  } catch (error) {
    console.error("Error detecting shared dreams:", error);
    return [];
  }
};

// Get location-based analytics
export const getLocationAnalytics = async () => {
  try {
    const locationStats = await Post.aggregate([
      {
        $match: {
          status: "published",
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          latitude: { $ne: null },
          longitude: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$city",
          count: { $sum: 1 },
          avgReactions: { $avg: "$reactionsCount" },
          lat: { $avg: "$latitude" },
          lng: { $avg: "$longitude" },
          area: { $first: "$area" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    return locationStats
      .filter((loc) => loc._id && loc._id !== "undefined")
      .map((loc) => ({
        ...loc,
        lat: typeof loc.lat === "number" ? loc.lat : undefined,
        lng: typeof loc.lng === "number" ? loc.lng : undefined,
      }));
  } catch (error) {
    console.error("Error getting location analytics:", error);
    return [];
  }
};

// Get dream category trends
export const getCategoryTrends = async (timeWindowDays = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeWindowDays);

    const categoryTrends = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: "published",
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return categoryTrends;
  } catch (error) {
    console.error("Error getting category trends:", error);
    return [];
  }
};

// Detect lucid dream patterns
export const getLucidDreamPatterns = async () => {
  try {
    const lucidStats = await Post.aggregate([
      {
        $match: {
          isLucid: true,
          status: "published",
        },
      },
      {
        $group: {
          _id: {
            category: "$category",
            hour: { $hour: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return lucidStats;
  } catch (error) {
    console.error("Error getting lucid dream patterns:", error);
    return [];
  }
};
