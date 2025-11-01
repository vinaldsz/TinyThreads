import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav
      className={styles.navbar}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* brand sits outside the centered .inner so it can be flush to the viewport left */}
      <div className={styles.brandWrapper}>
        <div className={styles.brand}>
          <img
            src="/TinyThreadsScribble.png"
            alt="TinyThreads"
            className={styles.brandLogo}
          />
        </div>
      </div>

      <div className={styles.inner}>
        <div className={styles.spacer} />
        <div className={styles.links}>
          <a href="/about" className={styles.aboutLink}>
            About
          </a>
        </div>
      </div>
    </nav>
  );
}
