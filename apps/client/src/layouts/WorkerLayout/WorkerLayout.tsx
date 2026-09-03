import { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { AppHeader, WorkerSidebar } from "@/components";
import { useAuth } from "@/features/auth";
import styles from "./WorkerLayout.module.css";

const LOGOUT_ERROR = "Не удалось выйти. Попробуйте ещё раз.";

export default function WorkerLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError(LOGOUT_ERROR);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={styles.page}>
      <AppHeader
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
        user={user}
      />

      <div className={styles.shell}>
        <WorkerSidebar />
        <main className={styles.content}>
          {logoutError && (
            <p className={styles.error} role="alert">
              {logoutError}
            </p>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
