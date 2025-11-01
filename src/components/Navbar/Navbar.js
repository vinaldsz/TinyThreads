import styles from "./Navbar.module.css";
import Image from "next/image";

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
          <Image
            src="/TinyThreadsScribble.png"
            alt="TinyThreads"
            className={styles.brandLogo}
            width={400}
            height={400}
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
