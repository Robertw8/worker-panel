import { LoginWidget } from "@/components";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.wordmark}>INFERNO</span>
        </div>
      </header>

      <main className={styles.main}>
        <LoginWidget />
      </main>
    </div>
  );
};

export default LoginPage;
