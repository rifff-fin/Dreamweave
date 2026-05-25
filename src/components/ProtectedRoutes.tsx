import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!user) return <Navigate to="/login" />;

  if (requireAdmin && !isAdmin) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;