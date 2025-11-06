import styles from "./JourneySection.module.css";
import Image from "next/image";

export default function JourneySection() {
  return (
    <div className={styles.journeyContainer}>
      <div className={styles.content}>
        <h3>It Started With Love</h3>
        <p>
          As a team of software development engineers, we recognized a common
          problem: parents waste hundreds of dollars annually on baby clothes
          worn for only 2-3 months, while existing platforms like Facebook
          Marketplace are slow and cluttered with irrelevant items.
        </p>
        <p>
          We asked ourselves, &quot;What if technology could make selling baby
          items 10x faster?&quot; That question became TinyThreads - a
          specialized marketplace where parents can list items in under 60
          seconds and find exactly what they need through baby-specific
          categories and local inventory.
        </p>
        <p>
          Today we&apos;re building a platform that transforms the way families
          share resources, making parenting more affordable and sustainable
          through better technology.
        </p>
      </div>

      <div className={styles.imageContainer}>
        <Image
          src="/images/about/journey-child.jpg"
          alt="Happy child playing with toys"
          width={400}
          height={300}
          className={styles.journeyImage}
        />
        <div className={styles.imageCaption}>
          <p>Every toy deserves another chance to make someone smile</p>
        </div>
      </div>
    </div>
  );
}
