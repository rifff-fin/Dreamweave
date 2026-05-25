import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import { setSocketIO } from "./socket.js";

import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import reactionRoutes from "./routes/reactionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import badgeRoutes from "./routes/badgeRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

dotenv.config();

const startServer = async () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  await connectDB();

  const server = http.createServer(app);
  const PORT = process.env.PORT || 5000;

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  setSocketIO(io);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        id: decoded.id,
        username: decoded.username || decoded.user?.username || null,
      };
      return next();
    } catch (error) {
      console.error("Socket auth error:", error);
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?.id;
    if (userId) {
      socket.join(userId);
    }

    socket.on("chat:send", async (payload) => {
      try {
        const { recipientId, content } = payload;
        if (!recipientId || !content?.trim()) return;

        const messagePayload = {
          senderId: userId,
          recipientId,
          content: content.trim(),
        };

        const ChatMessage = (await import("./models/ChatMessageModel.js")).default;
        const message = await ChatMessage.create(messagePayload);
        const populated = await ChatMessage.findById(message._id)
          .populate("senderId", "username")
          .populate("recipientId", "username")
          .lean();

        if (populated) {
          io.to(recipientId.toString()).emit("chat:message", populated);
          io.to(userId.toString()).emit("chat:message", populated);
        }
      } catch (error) {
        console.error("Error handling chat send:", error);
      }
    });

    socket.on("disconnect", () => {
      if (userId) {
        socket.leave(userId);
      }
    });

    socket.emit("socket:connected", { userId });
  });

  // Routes
  app.use("/api/users", userRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/reactions", reactionRoutes);
  app.use("/api/friends", friendRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/badges", badgeRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/comments", commentRoutes);

  // Health / info
  app.get("/", (req, res) => {
    res.send("NOCTIS API running...");
  });

  // Frontend route alias (facebook-like /chat at backend port)
  // Redirects to the React dev server route.
  app.get("/chat", (req, res) => {
    const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    res.redirect(`${clientOrigin}/chat`);
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
