import Notification from "../models/NotificationModel.js";
import { getSocketIO } from "../socket.js";

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit) || 20;

    const notifications = await Notification.find({ recipientId: userId })
      .populate("senderId", "username")
      .populate("relatedId")
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;

    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true },
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ message: "Failed to update notifications" });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

// Create notification helper (for internal use)
export const createNotification = async (
  recipientId,
  senderId,
  type,
  title,
  message,
  relatedId = null,
) => {
  try {
    const notification = new Notification({
      recipientId,
      senderId,
      type,
      title,
      message,
      relatedId,
    });

    await notification.save();

    const io = getSocketIO();
    if (io) {
      // send to the recipient room, plus also emit an app-level event
      io.to(recipientId.toString()).emit("notification:new", notification);
      io.emit("notification:new:global", notification);
    }


    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};
