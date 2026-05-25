import express from "express";
import { getChatMessages, sendChatMessage } from "../controllers/chatController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/messages/:userId", authenticateToken, getChatMessages);
router.post("/messages", authenticateToken, sendChatMessage);

export default router;
