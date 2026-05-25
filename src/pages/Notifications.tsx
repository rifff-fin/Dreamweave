import { useEffect, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { api } from "@/services/api";
import { useSocket } from "@/context/SocketContext";

const Notifications = () => {
  const { notifications: socketNotifications = [], unreadCount, markAsRead, markAllAsRead } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUnread, setCurrentUnread] = useState(0);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await api.notifications.getNotifications(50);
        setNotifications(response.notifications || []);
        setCurrentUnread(response.unreadCount || 0);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  useEffect(() => {
    if (socketNotifications.length > 0) {
      setNotifications(socketNotifications);
      setCurrentUnread(unreadCount || 0);
    }
  }, [socketNotifications, unreadCount]);

  const handleMarkRead = async (notificationId) => {
    await markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
    setCurrentUnread((prev) => Math.max(prev - 1, 0));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    setCurrentUnread(0);
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.notifications.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((item) => item._id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div className="min-h-screen bg-starfield pt-14">
      <main className="container mx-auto max-w-5xl px-4 py-8 page-enter">
        <div className="flex flex-col gap-6">
          <div className="noctis-card p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-heading font-semibold mb-1">Notifications</h1>
                <p className="text-sm text-muted-foreground">
                  Keep your notifications up to date and never miss a friend update.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm text-foreground transition hover:bg-muted"
                >
                  <Check className="h-4 w-4" /> Mark all read
                </button>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-sm text-primary">
                  <Bell className="h-4 w-4" />
                  {currentUnread} unread
                </span>
              </div>
            </div>
          </div>

          <div className="noctis-card overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No notifications available.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`flex flex-col gap-3 px-6 py-4 transition ${
                      notification.isRead ? "bg-background" : "bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkRead(notification._id)}
                            className="rounded-full border border-border bg-primary/10 px-3 py-1 text-xs text-primary transition hover:bg-primary/15"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition hover:bg-muted"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{notification.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
