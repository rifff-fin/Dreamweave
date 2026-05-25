import ChatMessage from "../models/ChatMessageModel.js";
import { getSocketIO } from "../socket.js";
import UserModel from "../models/UserModel.js";
import { createNotification } from "./notificationController.js";

export const getChatMessages = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const otherUserId = req.params.userId;

    if (!currentUserId || !otherUserId) {
      return res.status(400).json({ message: "Missing user id" });
    }

    const messages = await ChatMessage.find({
      $or: [
        { senderId: currentUserId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "username")
      .populate("recipientId", "username")
      .lean();

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Failed to fetch chat messages" });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    const senderId = req.user?.id;
    const { recipientId, content } = req.body;

    if (!senderId || !recipientId || !content?.trim()) {
      return res.status(400).json({ message: "recipientId and content are required" });
    }

    const message = await ChatMessage.create({
      senderId,
      recipientId,
      content: content.trim(),
    });

    const populatedMessage = await ChatMessage.findById(message._id)
      .populate("senderId", "username")
      .populate("recipientId", "username")
      .lean();

    // Create a notification for the recipient so it appears in NotificationDropdown/Notifications page.
    const sender = await UserModel.findById(senderId).select("username").lean();
    await createNotification(
      recipientId,
      senderId,
      "chat_message",
      "New Message",
      `${sender?.username || "Someone"} sent you a message: ${content.trim().slice(0, 60)}`,
      message._id,
    );

    const io = getSocketIO();
    if (io) {
      io.to(recipientId.toString()).emit("chat:message", populatedMessage);
      io.to(senderId.toString()).emit("chat:message", populatedMessage);
    }

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error("Error sending chat message:", error);
    res.status(500).json({ message: "Failed to send chat message" });
  }
};

