import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    reactionType: {
      type: String,
      enum: ["haunt", "relate", "fear", "lucid", "myth"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate reactions from the same user on the same post
reactionSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Reaction = mongoose.model("Reaction", reactionSchema);

export default Reaction;
