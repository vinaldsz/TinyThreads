import styles from './page.module.css';
import { getDb } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import Image from 'next/image';
import BackButton from './BackButton';

function formatDate(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

function getDisplayName(users) {
  return users?.displayName || users?.name || 'Seller';
}

function getAvatar(users) {
  const avatar = users?.avatarUrl;
  if (typeof avatar === 'string' && avatar.trim()) {
    return avatar;
  }
  return null;
}

export default async function SellerProfilePage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const sellerId =
    resolvedParams?.id ||
    resolvedParams?.userId ||
    resolvedSearch?.id ||
    resolvedSearch?.sellerId ||
    null;

  const returnUrl = resolvedSearch?.from || null;
  console.log('returnUrl', returnUrl);

  console.log(
    '[SellerProfilePage] params:',
    resolvedParams,
    'searchParams:',
    resolvedSearch,
    'resolved sellerId:',
    sellerId,
  );

  if (!sellerId) {
    return (
      <div className={styles.container}>
        <BackButton returnUrl={returnUrl} />
        <div className={styles.card}>
          <h1 className={styles.title}>Seller Profile</h1>
          <p className={styles.muted}>No seller id provided.</p>
        </div>
      </div>
    );
  }

  let seller = null;
  try {
    const db = await getDb();
    const users = db.collection('users');

    const maybeObjectId = ObjectId.isValid(sellerId)
      ? new ObjectId(sellerId)
      : null;

    const query = maybeObjectId
      ? { _id: maybeObjectId }
      : {
          $or: [
            { _id: sellerId },
            { id: sellerId },
            { userId: sellerId },
            { sellerId: sellerId },
          ],
        };

    console.log('[SellerProfilePage] query:', query);
    seller = await users.findOne(query);
    console.log('[SellerProfilePage] seller result:', seller);
  } catch (err) {
    console.error('Error loading seller profile', err);
    seller = null;
  }

  const avatar = getAvatar(seller);
  const name = getDisplayName(seller);

  return (
    <div className={styles.container}>
      <BackButton returnUrl={returnUrl} />
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            {avatar ? (
              <Image
                src={avatar}
                alt={name}
                width={72}
                height={72}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarFallback}>{name.charAt(0)}</div>
            )}
          </div>
          <div>
            <h1 className={styles.title}>{name}</h1>
            {seller.email && (
              <div className={styles.subtle}>{seller.email}</div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.label}>About</div>
          <div className={styles.value}>{seller.bio || '—'}</div>
        </div>

        <div className={styles.sectionGrid}>
          <div>
            <div className={styles.label}>Location</div>
            <div className={styles.value}>{seller.location || '—'}</div>
          </div>
          <div>
            <div className={styles.label}>Member since</div>
            <div className={styles.value}>{formatDate(seller.createdAt)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
