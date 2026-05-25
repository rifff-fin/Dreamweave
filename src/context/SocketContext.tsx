import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      if (socket) {
        socket.disconnect();
      }
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const baseUrl = apiUrl.replace(/\/api$/, "") || "http://localhost:5000";

    const newSocket = io(baseUrl, {
      auth: {
        token: localStorage.getItem("token"),
      },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setSocketConnected(true);
    });

    newSocket.on("disconnect", () => {
      setSocketConnected(false);
    });

    newSocket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...(prev || [])]);
      setUnreadCount((prev) => (prev || 0) + 1);
    });

    // Chat page listens to this event on the shared socket instance.
    newSocket.on("chat:message", () => {});


    return () => {
      newSocket.disconnect();
      setSocket(null);
      setSocketConnected(false);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const response = await api.notifications.getNotifications(20);
        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      await api.notifications.markAsRead(notificationId);
      setNotifications((prev) =>
        (prev || []).map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item,
        ),
      );
      setUnreadCount((prev) => Math.max((prev || 0) - 1, 0));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) =>
        (prev || []).map((item) => ({ ...item, isRead: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const sendChatMessage = async (recipientId, content) => {
    try {
      if (!recipientId || !content?.trim()) return null;
      if (socket && socket.connected) {
        socket.emit("chat:send", { recipientId, content: content.trim() });
        return true;
      }
      await api.chat.sendMessage(recipientId, content);
      return true;
    } catch (error) {
      console.error("Failed to send chat message:", error);
      return false;
    }
  };

  const value = useMemo(
    () => ({
      socket,
      notifications,
      unreadCount,
      socketConnected,
      markAsRead,
      markAllAsRead,
      setNotifications,
      setUnreadCount,
      sendChatMessage,
    }),
    [socket, notifications, unreadCount, socketConnected],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};
