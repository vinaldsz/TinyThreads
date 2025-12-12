import styles from './profile.module.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { getDb } from '../../lib/mongodb';
import ProfileEditor from '../../components/ProfileEditor/AboutEditor.js';
import NameEditor from '../../components/ProfileEditor/NameEditor';
import AvatarEditor from '../../components/ProfileEditor/AvatarEditor';
import LocationEditor from '../../components/ProfileEditor/LocationEditor';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className={styles.wrapper}>
        <Link href="/" className={styles.backButton}>
          ← Back
        </Link>
        <div className={styles.container}>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.subtitle}>Manage your personal information</p>

          <h2 className={styles.name}>Not signed in</h2>
          <p className={styles.empty}>Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const db = await getDb();
  const users = db.collection('users');
  const user = await users.findOne({ email: session.user.email });

  if (!user) {
    return (
      <div className={styles.wrapper}>
        <Link href="/" className={styles.backButton}>
          ← Back
        </Link>
        <div className={styles.container}>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.subtitle}>Manage your personal information</p>

          <h2 className={styles.name}>Profile</h2>
          <p className={styles.empty}>No profile found for your account.</p>
        </div>
      </div>
    );
  }

  const avatar = user.avatarUrl || '';

  return (
    <div className={styles.wrapper}>
      <Link href="/" className={styles.backButton}>
        ← Back
      </Link>
      <div className={styles.container}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>Manage your personal information</p>

        <div className={styles.header}>
          <AvatarEditor initialAvatar={avatar} />
          <div>
            <NameEditor initialName={user.displayName || user.name} />
            <div className={styles.email}>{user.email}</div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>About</div>
          <div className={styles.value}>
            <ProfileEditor initialBio={user.bio || ''} />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Location</div>
          <div className={styles.value}>
            <LocationEditor initialLocation={user.location || ''} />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Verification Status</div>
          <div className={styles.value}>
            {user.isVerified ? (
              <div className={styles.verifiedStatus}>
                <span className={styles.verifiedBadge}>✓</span>
                <span className={styles.verifiedText}>Verified Seller</span>
                {user.verifiedAt && (
                  <span className={styles.verifiedDate}>
                    Since {new Date(user.verifiedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ) : (
              <div className={styles.unverifiedStatus}>
                <span className={styles.unverifiedBadge}>○</span>
                <span className={styles.unverifiedText}>Not Verified</span>
                <Link href="/verify-account" className={styles.verifyLink}>
                  Verify now
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>Member since</div>
          <div className={styles.value}>
            {new Date(user.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
