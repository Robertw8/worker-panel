import { Navigate, Outlet } from "react-router";
import { AuthStatusScreen } from "./AuthStatusScreen";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
  const { retry, status, verificationError } = useAuth();

  if (verificationError) {
    return <AuthStatusScreen error={verificationError} onRetry={retry} />;
  }

  if (status === "loading") {
    return <AuthStatusScreen />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
