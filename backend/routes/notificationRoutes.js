import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all notifications
router.get("/", authenticateToken, getNotifications);

// Mark notification as read
router.put("/:notificationId/read", authenticateToken, markAsRead);

// Mark all notifications as read
router.put("/read/all", authenticateToken, markAllAsRead);

// Delete notification
router.delete("/:notificationId", authenticateToken, deleteNotification);

export default router;
