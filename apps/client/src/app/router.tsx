import { Navigate, Route, Routes } from "react-router";
import { AuthStatusScreen, ProtectedRoute, useAuth } from "@/features/auth";
import { DashboardPage, LoginPage } from "@/pages";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function LoginRoute() {
  const { retry, status, verificationError } = useAuth();

  if (verificationError) {
    return <AuthStatusScreen error={verificationError} onRetry={retry} />;
  }

  if (status === "loading") {
    return <AuthStatusScreen />;
  }

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
}
