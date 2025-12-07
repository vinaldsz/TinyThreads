'use client';
// src/app/favorites/page.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ItemCard from '../../components/ItemCard/ItemCard';
import styles from './page.module.css';

export default function FavoritesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Fetch favorites when user is authenticated
    if (status === 'authenticated') {
      fetchFavorites();
    }
  }, [status, router]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/favorites');

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      console.log('Favorites API response:', data);

      const items = data.favorites
        .filter((fav) => fav.item && fav.item._id) // Only include valid items
        .map((fav) => ({
          ...fav.item,
          _id: fav.item._id || fav.item.id,
          id: fav.item._id || fav.item.id,
        }));

      console.log('Processed items:', items);
      setFavorites(items);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your favorites...</p>
        </div>
      </div>
    );
  }

  // Show error if something went wrong
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Favorites</h1>
        </div>
        <div className={styles.error}>
          <p>⚠️ {error}</p>
          <button onClick={fetchFavorites} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>My Favorites</h1>
          <p className={styles.subtitle}>
            {favorites.length === 0
              ? 'No favorites yet'
              : `${favorites.length} item${favorites.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>❤️</div>
          <h2 className={styles.emptyTitle}>No favorites yet</h2>
          <p className={styles.emptyText}>
            Start exploring and save items you love by clicking the heart icon!
          </p>
          <button
            onClick={() => router.push('/')}
            className={styles.browseButton}
          >
            Browse Items
          </button>
        </div>
      ) : (
        /* Items Grid */
        <div className={styles.grid}>
          {favorites.map((item) => (
            <ItemCard key={item._id || item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
