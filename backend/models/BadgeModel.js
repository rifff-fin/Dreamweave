import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    badgeType: {
      type: String,
      enum: [
        "night_dreamer",
        "social_butterfly",
        "lucid_master",
        "storyteller",
        "trending_creator",
        "community_leader",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Prevent duplicate badges per user
badgeSchema.index({ userId: 1, badgeType: 1 }, { unique: true });

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;
