import { motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import FriendSearch from "@/components/FriendSearch";
import FriendRequestCard from "@/components/FriendRequestCard";
import FriendList from "@/components/FriendList";
import { useNavigate } from "react-router-dom";



import { AuthContext } from "@/context/AuthContext";
import { api } from "@/services/api";

const Friends = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriendsData();
  }, [user?.id]);


  const fetchFriendsData = async () => {
    try {
      setLoading(true);
      const [requestsData, friendsData] = await Promise.all([
        api.friends.getPendingRequests(user?.id),
        api.friends.getUserFriends(user?.id),
      ]);
      setPendingRequests(requestsData);
      setFriends(friendsData);
    } catch (error) {
      console.error("Error fetching friends data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.friends.acceptFriendRequest(requestId);
      setPendingRequests(pendingRequests.filter((r) => r._id !== requestId));
      fetchFriendsData(); // Refresh friends list
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.friends.rejectFriendRequest(requestId);
      setPendingRequests(pendingRequests.filter((r) => r._id !== requestId));
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await api.friends.removeFriend(friendId);
      setFriends(friends.filter((f) => f._id !== friendId));
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  // const navigate = useNavigate();

  const handleFriendAdded = () => {

    fetchFriendsData(); // Refresh when new friend is added
  };

  const handleChatFriend = (friendId: string) => {
    navigate(`/chat?friendId=${friendId}`);
  };


  return (
    <div className="min-h-screen bg-starfield pt-14">
      <main className="container mx-auto max-w-5xl px-4 py-8 page-enter">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-heading font-semibold mb-1">Friends</h1>
          <p className="text-sm text-muted-foreground">
            Connect with fellow dreamers
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Search */}
          <div className="noctis-card p-5">
            <h3 className="text-sm font-heading font-medium mb-4">Search</h3>
            <FriendSearch onFriendAdded={handleFriendAdded} />
          </div>

          {/* Pending */}
          <div className="noctis-card p-5">
            <h3 className="text-sm font-heading font-medium mb-4">
              Pending Requests
              <span className="ml-2 text-xs text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            </h3>
            <div className="space-y-3">
              {loading ? (
                <p className="text-xs text-muted-foreground">Loading...</p>
              ) : pendingRequests.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No pending requests
                </p>
              ) : (
                pendingRequests.map((req, i) => (
                  <FriendRequestCard
                    key={req._id}
                    username={req.senderId?.username || "Unknown"}
                    requestDate={new Date(req.createdAt).toLocaleDateString()}
                    index={i}
                    onAccept={() => handleAcceptRequest(req._id)}
                    onReject={() => handleRejectRequest(req._id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Friends */}
            <div className="noctis-card p-5">
              <h3 className="text-sm font-heading font-medium mb-4">
                Your Friends
              </h3>
              <FriendList
                friends={friends}
                onRemoveFriend={handleRemoveFriend}
                onChatFriend={handleChatFriend}
              />
            </div>

        </div>
      </main>
    </div>
  );
};

export default Friends;
