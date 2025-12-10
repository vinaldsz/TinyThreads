'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export default function MyPurchasesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchPurchases();
    }
  }, [status, router]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/purchases');
      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }
      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleItemClick = (itemId) => {
    router.push(`/Items/${itemId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your purchases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchPurchases} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Purchases</h1>
        <p className={styles.subtitle}>
          {purchases.length === 0
            ? "You haven't made any purchases yet"
            : `You have ${purchases.length} purchase${purchases.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {purchases.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🛍️</div>
          <h3>No purchases yet</h3>
          <p>Items you purchase will appear here</p>
          <button
            onClick={() => router.push('/')}
            className={styles.browseButton}
          >
            Browse Items
          </button>
        </div>
      ) : (
        <div className={styles.purchasesList}>
          {purchases.map((purchase) => (
            <div key={purchase.transactionId} className={styles.purchaseCard}>
              <div className={styles.purchaseHeader}>
                <span className={styles.purchaseDate}>
                  Purchased on {formatDate(purchase.purchaseDate)}
                </span>
                <span className={styles.purchasePrice}>
                  ${purchase.price.toFixed(2)}
                </span>
              </div>

              {purchase.item ? (
                <div
                  className={styles.itemDetails}
                  onClick={() => handleItemClick(purchase.item.id)}
                >
                  <div className={styles.itemImage}>
                    <Image
                      src={
                        purchase.item.imageUrls?.[0] || '/placeholder-image.jpg'
                      }
                      alt={purchase.item.title}
                      fill
                      sizes="120px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>

                  <div className={styles.itemInfo}>
                    <h3>{purchase.item.title}</h3>
                    <div className={styles.itemMeta}>
                      <span className={styles.badge}>
                        {purchase.item.condition}
                      </span>
                      <span className={styles.badge}>{purchase.item.size}</span>
                      {purchase.item.category && (
                        <span className={styles.badge}>
                          {purchase.item.category}
                        </span>
                      )}
                    </div>

                    {purchase.item.location && (
                      <p className={styles.location}>
                        📍 {purchase.item.location}
                      </p>
                    )}

                    {purchase.item.sellerName && (
                      <p className={styles.seller}>
                        Seller: {purchase.item.sellerName}
                        {purchase.item.sellerEmail && (
                          <a
                            href={`mailto:${purchase.item.sellerEmail}`}
                            className={styles.emailLink}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Contact
                          </a>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.itemUnavailable}>
                  <p>Item details unavailable</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
