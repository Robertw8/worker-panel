import type { AuthUser } from "@inferno/shared";
import styles from "./AppHeader.module.css";

interface AppHeaderProps {
  isLoggingOut?: boolean;
  onLogout?: () => void;
  user?: AuthUser | null;
}

export function AppHeader({ isLoggingOut = false, onLogout, user }: AppHeaderProps) {
  const displayName = user?.name ?? user?.username ?? "Telegram user";
  const photoUrl = getSafePhotoUrl(user?.photoUrl);
  const initial = displayName.trim().charAt(0).toUpperCase() || "I";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand} aria-label="INFERNO">
          <span className={styles.brandMark} aria-hidden="true">
            I
          </span>
          <span className={styles.wordmark}>INFERNO</span>
        </div>

        {user && (
          <div className={styles.account}>
            <span className={styles.accountName}>{displayName}</span>
            <span className={styles.avatar}>
              {photoUrl ? (
                <img src={photoUrl} alt="" />
              ) : (
                <span aria-hidden="true">{initial}</span>
              )}
            </span>
            {onLogout && (
              <button
                className={styles.logoutButton}
                type="button"
                aria-label="Выйти"
                title="Выйти"
                disabled={isLoggingOut}
                onClick={onLogout}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10" />
                  <path d="m15 8 4 4-4 4" />
                  <path d="M9 12h10" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

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
