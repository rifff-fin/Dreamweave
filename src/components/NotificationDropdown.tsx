import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { useSocket } from "@/context/SocketContext";

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const {
    notifications = [],
    unreadCount = 0,
    markAsRead,
    markAllAsRead,
  } = useSocket();

  const getPath = (notification) => {
    switch (notification.type) {
      case "friend_request":
      case "friend_accept":
        return "/friends";
      case "post_reaction":
      case "friend_reaction":
        return "/feed";
      case "badge_earned":
      case "milestone":
        return "/profile";
      default:
        return "/notifications";
    }
  };

  const handleItemClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-xs text-muted-foreground">Latest updates and alerts</p>
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  to={getPath(notification)}
                  key={notification._id}
                  onClick={() => handleItemClick(notification)}
                  className={`group flex items-start gap-3 border-b border-border px-4 py-3 transition-colors ${
                    notification.isRead ? "bg-background" : "bg-primary/5"
                  } hover:bg-muted/50`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted-foreground/10 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))
            )}
          </div>
          <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            <span>{notifications.filter((item) => !item.isRead).length} unread</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
