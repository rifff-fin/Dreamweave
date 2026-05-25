import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FriendList from "@/components/FriendList";
import PostCard from "@/components/PostCard";
import BadgePanel from "@/components/BadgePanel";
import {
  User,
  Moon,
  Flame,
  Eye,
  UserPlus,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import type { Post } from "@/types/noctis";

interface UserStats {
  dreamsCount: number;
  friendsCount: number;
  viewsCount: number;
}

interface UserProfile {
  _id: string;
  username: string;
  streakCount: number;
  role: string;
  createdAt: string;
}

type StatsView = null | "dreams" | "streak" | "friends" | "views";

const Profile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<
    "none" | "pending" | "friends" | "sent" | "received" | "self"
  >("none");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [statsView, setStatsView] = useState<StatsView>(null);

  // Determine which user to show
  const displayUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    if (!displayUserId) return;
    fetchProfileData();
  }, [displayUserId, currentUser]);

  const fetchProfileData = async () => {
    if (!displayUserId) return;

    try {
      setIsLoading(true);

      // For own profile, use stored user data; otherwise fetch from API
      if (isOwnProfile && currentUser) {
        setProfileUser({
          _id: currentUser.id,
          username: currentUser.username,
          streakCount: currentUser.streakCount || 0,
          role: currentUser.role,
          createdAt: currentUser.joinDate || new Date().toISOString(),
        });
      } else {
        const userProfile = await api.users.getUserProfile(displayUserId);
        setProfileUser({
          _id: userProfile._id,
          username: userProfile.username,
          streakCount: userProfile.streakCount || 0,
          role: userProfile.role || "user",
          createdAt: userProfile.createdAt || new Date().toISOString(),
        });
      }

      // Fetch user stats
      const statsResponse = await api.users.getUserStats(displayUserId);
      setStats(statsResponse);

      // Fetch user's posts
      const userPosts = await api.posts.getUserPosts(displayUserId);
      setPosts(userPosts);

      // Fetch user's friends
      try {
        const userFriends = await api.friends.getUserFriends(displayUserId);
        setFriends(userFriends || []);
      } catch (error) {
        console.error("Failed to fetch friends:", error);
      }

      // Check friendship status if viewing another user's profile
      if (!isOwnProfile && currentUser) {
        checkFriendshipStatus(displayUserId);
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFriendshipStatus = async (targetUserId: string) => {
    try {
      const statusResponse =
        await api.friends.getFriendshipStatus(targetUserId);
      setFriendshipStatus(statusResponse.status);
      setRequestId(statusResponse.requestId || null);
    } catch (error) {
      console.error("Error checking friendship status:", error);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await api.friends.sendFriendRequest(displayUserId);
      setFriendshipStatus("sent");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleCancelRequest = async () => {
    try {
      if (requestId) {
        // Canceling a pending request: the API uses rejectFriendRequest.
        await api.friends.rejectFriendRequest(requestId);
        setFriendshipStatus("none");
        setRequestId(null);
      }
    } catch (error) {
      console.error("Error canceling friend request:", error);
    }
  };

  const handleAcceptReceivedRequest = async () => {
    try {
      if (requestId) {
        await api.friends.acceptFriendRequest(requestId);
        setFriendshipStatus("friends");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-starfield pt-14 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isLoading ? "Loading profile..." : "Profile not found"}
          </p>
        </div>
      </div>
    );
  }

  const joinDate = new Date(profileUser.createdAt);
  const daysSinceJoin = Math.floor(
    (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const displayStats = stats || {
    dreamsCount: 0,
    friendsCount: 0,
    viewsCount: 0,
  };

  const statItems = [
    {
      icon: Moon,
      label: "Dreams",
      value: displayStats.dreamsCount.toString(),
      viewKey: "dreams" as const,
    },
    {
      icon: Flame,
      label: "Streak",
      value: profileUser.streakCount?.toString() || "0",
      viewKey: "streak" as const,
    },
    {
      icon: User,
      label: "Friends",
      value: displayStats.friendsCount.toString(),
      viewKey: "friends" as const,
    },
    {
      icon: Eye,
      label: "Views",
      value: displayStats.viewsCount.toString(),
      viewKey: "views" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-starfield pt-14">
      <main className="container mx-auto max-w-3xl px-4 py-8 page-enter">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-10 flex flex-col items-center text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card mb-4">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>

          <h1 className="text-2xl font-heading font-semibold">
            {profileUser.username}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dreamer since {daysSinceJoin} {daysSinceJoin === 1 ? "day" : "days"}{" "}
            ago
          </p>

          {/* Friend Action Button (only on other user's profile) */}
          {!isOwnProfile && currentUser && (
            <div className="mt-4">
              {friendshipStatus === "friends" && (
                <Button disabled className="bg-green-600/20 text-green-400">
                  <UserCheck className="h-4 w-4 mr-2" /> Friends
                </Button>
              )}
              {friendshipStatus === "received" && (
                <Button
                  onClick={handleAcceptReceivedRequest}
                  className="bg-primary/20 text-primary hover:bg-primary/30"
                >
                  <UserCheck className="h-4 w-4 mr-2" /> Accept Request
                </Button>
              )}
              {friendshipStatus === "sent" && (
                <Button
                  variant="outline"
                  onClick={handleCancelRequest}
                  className="text-yellow-400 border-yellow-400/50"
                >
                  <UserX className="h-4 w-4 mr-2" /> Request Sent
                </Button>
              )}
              {friendshipStatus === "none" && (
                <Button
                  onClick={handleSendFriendRequest}
                  className="bg-primary/20 text-primary hover:bg-primary/30"
                >
                  <UserPlus className="h-4 w-4 mr-2" /> Add Friend
                </Button>
              )}
            </div>
          )}

          <div className="mt-6 flex gap-8">
            {statItems.map(({ icon: Icon, label, value, viewKey }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatsView(statsView === viewKey ? null : viewKey)}
                className="text-center cursor-pointer group"
              >
                <Icon className="mx-auto mb-1 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <div className="text-lg font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                  {value}
                </div>
                <div className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {label}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <BadgePanel />
          <div className="noctis-card p-5">
            <h3 className="mb-4 text-sm font-heading font-medium">
              Your Friends
            </h3>
            <FriendList
              friends={friends}
              onChatFriend={(friendId) =>
                navigate(`/chat?friendId=${friendId}`)
              }
            />
          </div>
        </div>

        {/* Stats View Modal */}
        {statsView && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 noctis-card p-6 relative"
          >
            <button
              onClick={() => setStatsView(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {statsView === "dreams" && (
              <div>
                <h3 className="mb-4 text-lg font-heading font-semibold text-foreground flex items-center gap-2">
                  <Moon className="h-5 w-5" /> Dreams ({displayStats.dreamsCount})
                </h3>
                {posts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No dreams shared yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post, index) => (
                      <PostCard key={post._id} post={post} index={index} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {statsView === "streak" && (
              <div>
                <h3 className="mb-4 text-lg font-heading font-semibold text-foreground flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-400" /> Your Streak
                </h3>
                <div className="noctis-card p-4 bg-primary/5 border border-primary/20">
                  <div className="text-center">
                    <div className="text-4xl font-heading font-bold text-primary mb-2">
                      {profileUser.streakCount}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      consecutive day{profileUser.streakCount !== 1 ? "s" : ""} of
                      posting
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Keep sharing your dreams to maintain your streak!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {statsView === "friends" && (
              <div>
                <h3 className="mb-4 text-lg font-heading font-semibold text-foreground flex items-center gap-2">
                  <User className="h-5 w-5" /> Friends ({displayStats.friendsCount})
                </h3>
                <FriendList friends={friends} />
              </div>
            )}

            {statsView === "views" && (
              <div>
                <h3 className="mb-4 text-lg font-heading font-semibold text-foreground flex items-center gap-2">
                  <Eye className="h-5 w-5" /> Profile Views
                </h3>
                <div className="noctis-card p-4 bg-primary/5 border border-primary/20">
                  <div className="text-center">
                    <div className="text-4xl font-heading font-bold text-primary mb-2">
                      {displayStats.viewsCount}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      people have viewed your profile
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="mt-8">
          <h3 className="mb-4 text-lg font-heading font-semibold text-foreground">
            {isOwnProfile ? "Your Posts" : `${profileUser.username}'s Posts`}
          </h3>
          {posts.length === 0 ? (
            <div className="rounded-lg border border-border bg-secondary/50 p-6 text-sm text-muted-foreground">
              No posts to show yet.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <PostCard key={post._id} post={post} index={index} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
