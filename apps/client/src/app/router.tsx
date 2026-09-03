import { Navigate, Route, Routes } from "react-router";
import { AuthStatusScreen, ProtectedRoute, useAuth } from "@/features/auth";
import { WorkerLayout } from "@/layouts";
import {
  InfoPage,
  LandsPage,
  LoginPage,
  MailPage,
  ManualsPage,
  MaterialsPage,
  NotesPage,
} from "@/pages";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<WorkerLayout />}>
          <Route index element={<Navigate to="lands" replace />} />
          <Route path="lands" element={<LandsPage />} />
          <Route path="manuals" element={<ManualsPage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="mail" element={<MailPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="info" element={<InfoPage />} />
          <Route path="*" element={<Navigate to="lands" replace />} />
        </Route>
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
