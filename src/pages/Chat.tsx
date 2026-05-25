import { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";




import { MessageSquare, Send } from "lucide-react";
import { api } from "@/services/api";
import { AuthContext } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const { socket, socketConnected, sendChatMessage } = useSocket();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const fetchFriends = async () => {
      try {

        const data = await api.friends.getUserFriends(user?.id);
        setFriends(data);
      } catch (error) {
        console.error("Failed to load friends for chat:", error);
      }
    };
    if (user?.id) {
      fetchFriends();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!socket || !selectedFriend) return;

    const handleIncomingMessage = (message) => {
      const friendId = message.senderId._id === user?.id ? message.recipientId._id : message.senderId._id;
      if (selectedFriend._id === friendId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("chat:message", handleIncomingMessage);
    return () => {
      socket.off("chat:message", handleIncomingMessage);
    };
  }, [socket, selectedFriend, user?.id]);

  const fetchMessages = async (friend) => {
    if (!friend) return;
    setLoading(true);
    try {
      const response = await api.chat.getMessagesWithUser(friend._id);
      setMessages(response.messages || []);
      setSelectedFriend(friend);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedFriend || !draft.trim()) {
      return;
    }

    const messageContent = draft.trim();
    setDraft("");

    // Don't add optimistically - wait for socket response
    await sendChatMessage(selectedFriend._id, messageContent);
  };

  const selectedFriendName = selectedFriend?.username || "Select a friend";

  const friendIdFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("friendId");
  }, [location.search]);

  useEffect(() => {
    if (!friendIdFromQuery) return;
    const match = friends.find((f) => f._id === friendIdFromQuery);
    if (match) {
      fetchMessages(match);
    }
  }, [friendIdFromQuery, friends]);

  return (

    <div className="min-h-screen bg-starfield pt-14">
      <main className="container mx-auto max-w-6xl px-4 py-8 page-enter">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <section className="noctis-card p-5">
            <div className="mb-4 flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <h1 className="text-xl font-heading font-semibold">Chat</h1>
                <p className="text-sm text-muted-foreground">
                  Real-time chat with your friends.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {friends.length === 0 ? (
                <div className="rounded-xl border border-border bg-background/80 p-4 text-sm text-muted-foreground">
                  You have no friends yet. Find someone to chat with from the friends page.
                </div>
              ) : (
                friends.map((friend) => (
                  <button
                    key={friend._id}
                    onClick={() => fetchMessages(friend)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      selectedFriend?._id === friend._id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background/90 hover:border-primary/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{friend.username}</span>
                      <span className="text-xs text-muted-foreground">{friend.visionsCount || 0} dreams</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Streak: {friend.streakCount || 0}</p>
                  </button>
                ))
              )}
            </div>
            <button
              className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              onClick={() => navigate("/friends")}
            >
              Find friends to chat with
            </button>
          </section>

          <section className="noctis-card flex min-h-[60vh] flex-col">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-sm text-muted-foreground">Chatting with</p>
                <h2 className="text-lg font-semibold text-foreground">{selectedFriendName}</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${socketConnected ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                {socketConnected ? "Online" : "Offline"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Select a friend to start chatting.</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((message, index) => {
                    const isMine = message.senderId?._id === user?.id;
                    return (
                      <div
                        key={`${message._id || index}-${message.createdAt}`}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[80%] space-y-1 rounded-2xl border px-4 py-3 ${isMine ? "bg-primary/10 border-primary/30" : "bg-muted/70 border-border"}`}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold text-foreground">
                              {isMine ? "You" : message.senderId?.username || "Friend"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{message.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-border px-5 py-4">
              <div className="flex gap-3">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={selectedFriend ? "Type a message..." : "Select a friend first"}
                  disabled={!selectedFriend}
                  className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim() || !selectedFriend}
                  className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Chat;
