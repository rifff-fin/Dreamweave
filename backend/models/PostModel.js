import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,

    category: {
      type: String,
      enum: ["dream", "myth", "paranormal"],
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: String,
    latitude: Number,
    longitude: Number,
    locationType: String,
    division: String,
    tags: [String],

    city: String,
    area: String,
    authorName: String,

    isLucid: {
      type: Boolean,
      default: false,
    },

    isRecurring: {
      type: Boolean,
      default: false,
    },

    visibility: {
      type: String,
      enum: ["public", "friends", "anonymous"],
      default: "public",
    },

    status: {
      type: String,
      enum: ["published", "queued", "archived"],
      default: "published",
    },

    scheduledPublishTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Post = mongoose.model("Post", postSchema);

export default Post;
