import { AppHeader, LoginWidget } from "@/components";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  return (
    <div className={styles.page}>
      <AppHeader />

      <main className={styles.main}>
        <LoginWidget />
      </main>
    </div>
  );
};

export default LoginPage;
