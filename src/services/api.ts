const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = {
  async request(endpoint, method = "GET", data) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, data) {
    return this.request(endpoint, "POST", data);
  },

  put(endpoint, data) {
    return this.request(endpoint, "PUT", data);
  },

  delete(endpoint) {
    return this.request(endpoint, "DELETE");
  },

  // Friend-related APIs
  friends: {
    getUserFriends: (userId) => api.get(`/friends/user/${userId}`),
    getPendingRequests: (userId) => api.get(`/friends/requests/${userId}`),
    getFriendshipStatus: (targetUserId) =>
      api.get(`/friends/status/${targetUserId}`),
    sendFriendRequest: (receiverId) =>
      api.post("/friends/request/send", { receiverId }),
    acceptFriendRequest: (requestId) =>
      api.put(`/friends/request/${requestId}/accept`, {}),
    rejectFriendRequest: (requestId) =>
      api.put(`/friends/request/${requestId}/reject`, {}),
    removeFriend: (friendId) => api.delete(`/friends/${friendId}`),
  },

  // Reaction-related APIs
  reactions: {
    addReaction: (postId, reactionType) =>
      api.post("/reactions", { postId, reactionType }),
    getPostReactions: (postId) => api.get(`/reactions/post/${postId}`),
    getUserReaction: (postId) => api.get(`/reactions/post/${postId}/user`),
    removeReaction: (postId) => api.delete(`/reactions/post/${postId}`),
    getReactionStats: (postIds) => api.post("/reactions/stats", { postIds }),
  },

  // Post-related APIs
  posts: {
    createPost: (postData) => api.post("/posts", postData),
    getPosts: () => api.get("/posts"),
    getPublicFeed: () => api.get("/posts/feed/public"),
    getFriendsFeed: () => api.get("/posts/feed/friends"),
    getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  },

  // Auth-related APIs
  auth: {
    register: (userData) => api.post("/auth/register", userData),
    login: (credentials) => api.post("/auth/login", credentials),
  },

  // User-related APIs
  users: {
    getUserStats: (userId) => api.get(`/users/${userId}/stats`),
    getUserProfile: (userId) => api.get(`/users/${userId}`),
  },

  // Notification-related APIs
  notifications: {
    getNotifications: (limit = 20) => api.get(`/notifications?limit=${limit}`),
    markAsRead: (notificationId) =>
      api.put(`/notifications/${notificationId}/read`, {}),
    markAllAsRead: () => api.put(`/notifications/read/all`, {}),
    deleteNotification: (notificationId) =>
      api.delete(`/notifications/${notificationId}`),
  },

  // Chat-related APIs
  chat: {
    getMessagesWithUser: (friendId) => api.get(`/chat/messages/${friendId}`),
    sendMessage: (recipientId, content) =>
      api.post(`/chat/messages`, { recipientId, content }),
  },

  // Badge-related APIs
  badges: {
    getUserBadges: (userId) => api.get(`/badges/user/${userId}`),
    checkBadges: () => api.post(`/badges/check`, {}),
  },

  // Analytics-related APIs
  analytics: {
    getDashboard: () => api.get("/analytics/dashboard"),
    getTrendingTags: (timeWindow = 7) =>
      api.get(`/analytics/trending-tags?timeWindow=${timeWindow}`),
    getSharedDreams: (limit = 10) =>
      api.get(`/analytics/shared-dreams?limit=${limit}`),
    getLocationHeatmap: () => api.get("/analytics/locations"),
    getDreamTrends: (timeWindow = 7) =>
      api.get(`/analytics/trends?timeWindow=${timeWindow}`),
    getCategoryDistribution: () => api.get("/analytics/categories"),
    getLucidAnalytics: () => api.get("/analytics/lucid"),
  },

  // Comment-related APIs
  comments: {
    getPostComments: (postId) => api.get(`/comments/post/${postId}`),
    addComment: (postId, content) =>
      api.post("/comments", { postId, content }),
    deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
    updateComment: (commentId, content) =>
      api.put(`/comments/${commentId}`, { content }),
    getCommentCount: (postId) => api.get(`/comments/post/${postId}/count`),
  },
};
