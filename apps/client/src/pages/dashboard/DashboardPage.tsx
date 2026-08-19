import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth";
import styles from "./DashboardPage.module.css";

const LOGOUT_ERROR = "Unable to log out. Please try again.";

const DashboardPage = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const displayName = user.name ?? user.username ?? "Telegram user";
  const avatarUrl = getSafePhotoUrl(user.photoUrl);

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
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.wordmark}>INFERNO</span>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.card} aria-labelledby="dashboard-title">
          <span className={styles.successMark} aria-hidden="true">
            ✓
          </span>
          <p className={styles.eyebrow}>Session active</p>
          <h1 className={styles.title} id="dashboard-title">
            Authorization successful
          </h1>

          <div className={styles.profile}>
            {avatarUrl && (
              <img className={styles.avatar} src={avatarUrl} alt="" />
            )}
            <strong className={styles.name}>{displayName}</strong>
            {user.username && (
              <span className={styles.username}>@{user.username}</span>
            )}
            <span className={styles.telegramId}>
              Telegram ID: {user.telegramNumericId ?? user.telegramId}
            </span>
          </div>

          {logoutError && (
            <p className={styles.error} role="alert">
              {logoutError}
            </p>
          )}

          <button
            className={styles.logoutButton}
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            {isLoggingOut ? "Logging out…" : "Logout"}
          </button>
        </section>
      </main>
    </div>
  );
};

const getSafePhotoUrl = (photoUrl?: string): string | null => {
  if (!photoUrl) {
    return null;
  }

  try {
    const url = new URL(photoUrl);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};

export default DashboardPage;
