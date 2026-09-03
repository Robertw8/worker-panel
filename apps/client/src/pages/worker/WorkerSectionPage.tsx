import styles from "./WorkerSectionPage.module.css";

interface WorkerSectionPageProps {
  title: string;
}

export function WorkerSectionPage({ title }: WorkerSectionPageProps) {
  return (
    <section className={styles.panel} aria-labelledby="section-title">
      <header className={styles.header}>
        <h1 className={styles.title} id="section-title">
          {title}
        </h1>
      </header>
      <p className={styles.empty}>Раздел пока пуст</p>
    </section>
  );
}
