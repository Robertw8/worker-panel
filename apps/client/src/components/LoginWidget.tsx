import { useSearchParams } from "react-router";
import styles from "./LoginWidget.module.css";

const TelegramIcon = () => (
  <svg
    aria-hidden="true"
    className={styles.telegramIcon}
    viewBox="0 0 24 24"
  >
    <path d="M9.04 15.47 8.7 20.2c.5 0 .72-.22.98-.48l2.35-2.25 4.87 3.57c.9.5 1.53.24 1.77-.82L21.88 5.2c.33-1.3-.47-1.8-1.34-1.48L1.68 10.94c-1.29.5-1.27 1.22-.22 1.54l4.82 1.5L17.47 6.9c.53-.35 1.01-.16.62.19L9.04 15.47Z" />
  </svg>
);

const LoginWidget: React.FC = () => {
  const [searchParams] = useSearchParams();
  const hasAuthenticationError = searchParams.get("auth") === "error";

  const handleTelegramLogin = () => {
    window.location.assign("/auth/telegram/start");
  };

  return (
    <section className={styles.authContainer} aria-labelledby="login-title">
      <div className={styles.dataBlock}>
        <div className={styles.loginAuth}>
          <div className={styles.logoBlock} aria-hidden="true">
            <span className={styles.brandMark}>I</span>
          </div>

          <div className={styles.dataContent}>
            <h1 className={styles.title} id="login-title">
              Войдите в свой аккаунт
            </h1>

            {hasAuthenticationError && (
              <p className={styles.authError} role="alert">
                Не удалось войти через Telegram. Попробуйте ещё раз.
              </p>
            )}

            <div className={styles.buttonGroup}>
              <button
                className={styles.telegramButton}
                type="button"
                onClick={handleTelegramLogin}
              >
                <TelegramIcon />
                <span>Войти через Telegram</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginWidget;
