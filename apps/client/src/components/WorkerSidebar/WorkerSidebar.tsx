import { NavLink } from "react-router";
import styles from "./WorkerSidebar.module.css";

const sections = [
  { label: "Ленды", to: "/dashboard/lands" },
  { label: "Мануалы", to: "/dashboard/manuals" },
  { label: "Материалы", to: "/dashboard/materials" },
  { label: "Почта", to: "/dashboard/mail" },
  { label: "Заметки", to: "/dashboard/notes" },
  { label: "Информация", to: "/dashboard/info" },
] as const;

export function WorkerSidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Разделы панели">
      <nav className={styles.navigation}>
        {sections.map((section) => (
          <NavLink
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
            key={section.to}
            to={section.to}
          >
            {section.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
