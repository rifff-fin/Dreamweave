import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    streakCount: {
      type: Number,
      default: 0,
    },
    lastPostDate: {
      type: Date,
      default: null,
    },
    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Badge",
      },
    ],
    totalPosts: {
      type: Number,
      default: 0,
    },
    totalFriends: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
