'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './FavoriteButton.module.css';

export default function FavoriteButton({ itemId, className = '' }) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //const [favoriteId, setFavoriteId] = useState(null);

  // Check initial favorite status
  useEffect(() => {
    if (!session?.user?.id || !itemId) return;

    const checkFavoriteStatus = async () => {
      try {
        const response = await fetch(`/api/favorites/check?itemId=${itemId}`);
        const data = await response.json();
        setIsFavorited(data.isFavorited);
        //setFavoriteId(data.favoriteId);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [session?.user?.id, itemId]);

  const handleFavoriteToggle = async (e) => {
    e.preventDefault(); // Prevent card click
    e.stopPropagation(); // Prevent event bubbling

    if (!session?.user?.id) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    if (isLoading) return; // Prevent double clicks

    setIsLoading(true);

    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?itemId=${itemId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsFavorited(false);
          //setFavoriteId(null);
        } else {
          throw new Error('Failed to remove from favorites');
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId }),
        });

        if (response.ok) {
          await response.json();
          setIsFavorited(true);
          //setFavoriteId(data._id);
        } else {
          throw new Error('Failed to add to favorites');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Show user-friendly error message
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user is not logged in
  if (!session?.user?.id) {
    return null;
  }

  return (
    <button
      className={`${styles.favoriteButton} ${className} ${
        isFavorited ? styles.favorited : ''
      } ${isLoading ? styles.loading : ''}`}
      onClick={handleFavoriteToggle}
      disabled={isLoading}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={styles.heartIcon}
        viewBox="0 0 24 24"
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {isLoading && <div className={styles.spinner}></div>}
    </button>
  );
}
