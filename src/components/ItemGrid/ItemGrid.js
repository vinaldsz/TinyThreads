'use client';

// components/ItemGrid/ItemGrid.js
import styles from './ItemGrid.module.css';
import React from 'react';
import ItemCard from '../ItemCard/ItemCard';

export default function ItemGrid({
  items = [],
  loading = false,
  hasMore = true,
}) {
  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine}></div>
        <div className={styles.skeletonLineShort}></div>
        <div className={styles.skeletonLine}></div>
      </div>
    </div>
  );

  if (loading && items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.grid}>
          {[...Array(8)].map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3 className={styles.emptyTitle}>No items found</h3>
          <p className={styles.emptyDescription}>
            Try adjusting your filters or check back later for new listings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Items Header */}
      <div className={styles.itemsHeader}>
        <div className={styles.itemsCount}>Showing {items.length} items</div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {items.map((item, idx) => (
          <ItemCard
            key={item?.id ?? item?._id ?? item?.slug ?? idx}
            item={item}
          />
        ))}
      </div>

      {/* End message */}
      {!hasMore && items.length > 0 && (
        <div className={styles.endMessage}>
          <p>You have reached the end! 🎉</p>
        </div>
      )}
    </div>
  );
}
