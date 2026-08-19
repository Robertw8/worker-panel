import styles from "./AuthStatusScreen.module.css";

interface AuthStatusScreenProps {
  error?: string | null;
  onRetry?: () => void;
}

export function AuthStatusScreen({ error, onRetry }: AuthStatusScreenProps) {
  return (
    <main className={styles.page} aria-live="polite">
      <section className={styles.card}>
        {error ? (
          <>
            <p className={styles.error} role="alert">
              {error}
            </p>
            <button className={styles.button} type="button" onClick={onRetry}>
              Try again
            </button>
          </>
        ) : (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <p className={styles.message}>Checking your session…</p>
          </>
        )}
      </section>
    </main>
  );
}
