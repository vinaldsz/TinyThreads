"use client";
import styles from './ItemCard.module.css'
import { useState } from 'react';

export default function ItemCard({ item }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const getConditionClass = (condition) => {
    switch (condition) {
      case 'New': return styles.conditionNew;
      case 'Like New': return styles.conditionLikeNew;
      case 'Good': return styles.conditionGood;
      case 'Fair': return styles.conditionFair;
      default: return styles.conditionDefault;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Clothing': return '👕';
      case 'Toys': return '🧸';
      case 'Books': return '📚';
      case 'Gear': return '🍼';
      case 'Other': return '✨';
      default: return '🛍️';
    }
  };

  return (
    <div className={styles.card}>
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
              <div className={styles.categoryIcon}>{getCategoryIcon(item.category)}</div>
              <p className={styles.noImageText}>No Image</p>
            </div>
          </div>
        ) : (
          <img
            src={item.imageUrl}
            alt={item.title}
            className={`${styles.image} ${imageLoaded ? styles.imageLoaded : styles.imageLoading}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* Price Badge */}
        <div className={styles.priceBadge}>
          <span className={styles.priceText}>
            ${item.price}
          </span>
        </div>

        {/* Condition Badge */}
        <div className={styles.conditionBadge}>
          <span className={getConditionClass(item.condition)}>
            {item.condition}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Category & Age Range */}
        <div className={styles.metaRow}>
          <span className={styles.category}>
            <span className={styles.categoryIconSmall}>{getCategoryIcon(item.category)}</span>
            {item.category}
          </span>
          <span className={styles.ageRange}>
            {item.ageRange}
          </span>
        </div>

        {/* Title */}
        <h3 className={styles.title}>
          {item.title}
        </h3>

        {/* Description */}
        <p className={styles.description}>
          {item.description}
        </p>

        {/* Seller Info */}
        <div className={styles.sellerInfo}>
          <div className={styles.seller}>
            <div className={styles.sellerAvatar}>
              {item.sellerName.charAt(0)}
            </div>
            <span>by {item.sellerName}</span>
          </div>
        </div>

        {/* Action Button */}
        <button className={styles.viewButton}>
          View Details
        </button>
      </div>
    </div>
  );
}