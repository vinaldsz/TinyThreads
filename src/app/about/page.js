import Link from 'next/link';
import styles from './page.module.css';
import BeliefCard from './components/BeliefCard/BeliefCard';
import TeamCard from './components/TeamCard/TeamCard';
import JourneySection from './components/JourneySection/JourneySection';

export default function AboutPage() {
  const beliefs = [
    {
      icon: '💝',
      title: 'Family First',
      description:
        'Our community always supports parents, sharing resources and kindness.',
    },
    {
      icon: '🌱',
      title: 'Love for Earth',
      description:
        'Every item gets a small gift of care for the planet our children will inherit.',
    },
    {
      icon: '🛡️',
      title: 'Safe & Gentle',
      description:
        'We ensure safe home safety standards so you can shop with peace of mind.',
    },
    {
      icon: '💰',
      title: 'Budget Friendly',
      description:
        "Quality baby items shouldn't cost a fortune. We help families save while giving items new life.",
    },
  ];

  const teamMembers = [
    {
      name: 'Vinal Dalcy Dsouza',
      role: 'Software Development Engineer',
      description:
        'Full-stack engineer focused on backend infrastructure, API development, and system architecture for TinyThreads.',
      image: '/images/about/team/member-1.png',
      altText: 'Vinal Dalcy Dsouza, Software Development Engineer',
    },
    {
      name: 'Abhishek Tuteja',
      role: 'Software Development Engineer',
      description:
        'Backend specialist working on database design, cloud integration, and building scalable marketplace infrastructure.',
      image: '/images/about/team/member-2.png',
      altText: 'Abhishek Tuteja, Software Development Engineer',
    },
    {
      name: 'Xiaowei Qi',
      role: 'Software Development Engineer',
      description:
        'Frontend engineer creating intuitive user interfaces and seamless user experiences for the TinyThreads platform.',
      image: '/images/about/team/member-3.png',
      altText: 'Xiaowei Qi, Software Development Engineer',
    },
  ];

  return (
    <div className={styles.aboutContainer}>
      <Link href="/" className={styles.backButton}>
        ← Back to Home
      </Link>

      <section className={styles.heroSection}>
        <h1>Welcome to Our Story</h1>
        <h2>About Tiny Threads</h2>
        <p>
          A warm community where parents share the joy of quality baby items,
          giving each piece a new start while making parenting more affordable
          and sustainable for everyone.
        </p>
      </section>

      <section className={styles.journeySection}>
        <h2>Our Journey</h2>
        <JourneySection />
      </section>

      <section className={styles.beliefsSection}>
        <h2>What We Believe In</h2>
        <div className={styles.beliefsGrid}>
          {beliefs.map((belief, index) => (
            <BeliefCard
              key={index}
              icon={belief.icon}
              title={belief.title}
              description={belief.description}
            />
          ))}
        </div>
      </section>

      <section className={styles.helloSection}>
        <h2>Say Hello</h2>
        <p className={styles.helloText}>
          We are just software engineers trying to make the parenting journey a
          little easier and a lot more sustainable.
        </p>
      </section>

      <section className={styles.teamSection}>
        <h2>The Team Behind Tiny Threads</h2>
        <div className={styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <TeamCard
              key={index}
              name={member.name}
              role={member.role}
              description={member.description}
              image={member.image}
              altText={member.altText}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
