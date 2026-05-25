import Post from "../models/PostModel.js";

// Middleware to publish queued posts during midnight window
export const publishQueuedPosts = async (req, res, next) => {
  try {
    const now = new Date();
    const hours = now.getHours();

    // Only run this during midnight window (0:00 - 3:59)
    if (hours >= 0 && hours < 4) {
      // Update all queued posts that are scheduled for now or earlier
      await Post.updateMany(
        {
          status: "queued",
          scheduledPublishTime: { $lte: now },
        },
        {
          $set: { status: "published" },
        },
      );
    }

    next();
  } catch (error) {
    console.error("Error in nightmodeMiddleware:", error);
    next();
  }
};

// Check if current user is in "nightmode" (between 12:00 AM and 4:00 AM)
export const isNightmodeActive = (req, res, next) => {
  const now = new Date();
  const hours = now.getHours();
  const isNightmode = hours >= 0 && hours < 4;

  req.isNightmode = isNightmode;
  req.nightmodeInfo = {
    active: isNightmode,
    currentHour: hours,
    windowStart: "00:00",
    windowEnd: "04:00",
  };

  next();
};

// Middleware to prevent posting outside nightmode hours (strict enforcement)
export const enforceNightmodePosting = (req, res, next) => {
  // Only enforce on POST requests to /api/posts
  if (req.method === "POST" && req.path === "/api/posts") {
    const now = new Date();
    const hours = now.getHours();
    const isNightmode = hours >= 0 && hours < 4;

    if (!isNightmode) {
      return res.status(403).json({
        message:
          "Posting is only allowed between 12:00 AM and 4:00 AM. Your post has been queued and will be published during the next midnight window.",
        queued: true,
        nextWindowStart: getNextNightmodeStart(),
      });
    }
  }

  next();
};

// Helper to calculate next midnight window start
const getNextNightmodeStart = () => {
  const now = new Date();
  const nextMidnight = new Date(now);

  if (now.getHours() >= 4) {
    // After 4 AM, next window is tomorrow at midnight
    nextMidnight.setDate(nextMidnight.getDate() + 1);
  }

  nextMidnight.setHours(0, 0, 0, 0);
  return nextMidnight.toISOString();
};
