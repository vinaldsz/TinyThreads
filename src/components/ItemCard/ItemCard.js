'use client';
import styles from './ItemCard.module.css';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
export default function ItemCard({ item }) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cleanImageUrl = (url) => {
    if (!url || url === 'undefined') return null;

    // Remove 'undefined/' prefix if it exists
    if (typeof url === 'string' && url.startsWith('undefined/')) {
      url = url.replace('undefined/', '/');
    }

    // Ensure proper URL format for local images
    if (
      typeof url === 'string' &&
      !url.startsWith('http') &&
      !url.startsWith('/')
    ) {
      return `/${url}`;
    }

    return url;
  };

  const images = useMemo(() => {
    const rawImages =
      Array.isArray(item.imageUrls) && item.imageUrls.length > 0
        ? item.imageUrls
        : [item.imageUrl];

    const cleanedImages = rawImages
      .map(cleanImageUrl)
      .filter((url) => url && url !== '/'); // Remove null/invalid URLs

    // Fallback to placeholder if no valid images
    return cleanedImages.length > 0
      ? cleanedImages
      : ['/placeholder-image.jpg'];
  }, [item.imageUrls, item.imageUrl]);

  // Add this right after the images array definition
  console.log('=== ITEM DEBUG ===');
  console.log('Full item object:', item);
  console.log('item.buyerUsername:', item.buyerUsername);
  console.log('item.imageUrl:', item.imageUrl);
  console.log('item.imageUrls:', item.imageUrls);
  console.log('images array:', images);
  console.log('==================');

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const prettifyCategory = (category) => {
    if (!category) return '';
    return String(category)
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
  };

  const getConditionClass = (condition) => {
    switch (condition) {
      case 'new':
        return styles.conditionNew;
      case 'like-new':
        return styles.conditionLikeNew;
      case 'good':
        return styles.conditionGood;
      case 'fair':
        return styles.conditionFair;
      default:
        return styles.conditionDefault;
    }
  };

  const getConditionLabel = (condition) => {
    switch (condition) {
      case 'like-new':
        return 'Like New';
      case 'good':
        return 'Good';
      case 'new':
        return 'New';
      case 'fair':
        return 'Fair';
      default:
        // Fallback: try to prettify by replacing hyphens with spaces and title-casing
        if (!condition) return '';
        return condition
          .split('-')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ');
    }
  };

  const getCategoryIcon = (category) => {
    const value = (category || '').toLowerCase();

    switch (value) {
      case 'clothing':
        return '👕';
      case 'toys':
        return '🧸';
      case 'books':
        return '📚';
      case 'gear':
        return '🍼';
      case 'other':
        return '✨';
      default:
        return '🛍️';
    }
  };

  const handleItemClick = () => {
    router.push(`/Items/${item.id}`);
  };

  return (
    <div
      className={styles.card}
      onClick={handleItemClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Image Container */}
      <div className={styles.imageContainer}>
        {!imageLoaded && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
          </div>
        )}

        {imageError ? (
          <div className={styles.noImageContainer}>
            <div className={styles.noImageContent}>
              <div className={styles.categoryIcon}>
                {getCategoryIcon(item.category)}
              </div>
              <p className={styles.noImageText}>No Image</p>
            </div>
          </div>
        ) : (
          <div className={styles.imageContainer}>
            <Image
              src={images[currentIndex]}
              alt={item.title}
              className={`${styles.image} ${
                imageLoaded ? styles.imageLoaded : styles.imageLoading
              }`}
              fill
              sizes="(max-width: 600px) 100vw, 33vw"
              onLoadingComplete={handleImageLoad}
              onError={handleImageError}
            />

            {images.length > 1 && (
              <div className={styles.carouselControls}>
                <button
                  className={styles.carouselBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1,
                    );
                  }}
                >
                  ‹
                </button>

                <span className={styles.carouselCounter}>
                  {currentIndex + 1}/{images.length}
                </span>

                <button
                  className={styles.carouselBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) =>
                      prev === images.length - 1 ? 0 : prev + 1,
                    );
                  }}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}

        {/* Price Badge */}
        <div className={styles.priceBadge}>
          <span className={styles.priceText}>
            {item.price === 0 ? 'Free' : `$${item.price}`}
          </span>
        </div>

        {/* Condition Badge */}
        <div className={styles.conditionBadge}>
          <span className={getConditionClass(item.condition)}>
            {getConditionLabel(item.condition)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Category & Age Range */}
        <div className={styles.metaRow}>
          <span className={styles.category}>
            <span className={styles.categoryIconSmall}>
              {getCategoryIcon(item.category)}
            </span>
            {prettifyCategory(item.category)}
          </span>
          <span className={styles.ageRange}>{item.ageRange}</span>
        </div>

        {/* Title */}
        <h3 className={styles.title}>{item.title}</h3>

        {/* Description */}
        <p className={styles.description}>{item.description}</p>
        {/* Seller Info */}
        {/* <div className={styles.sellerInfo}>
          <div className={styles.seller}>
            <div className={styles.sellerAvatar}>
              {item.sellerName}
            </div>
            <span>by {item.sellerName}</span>
          </div>
        </div>
        */}
        {/* Action Button */}
        <button className={styles.viewButton}>View Details</button>
      </div>
    </div>
  );
}
