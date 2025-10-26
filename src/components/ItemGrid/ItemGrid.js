"use client";

// components/ItemGrid/ItemGrid.js
import styles from "./ItemGrid.module.css";
import { useState } from "react";
import ItemCard from "../ItemCard/ItemCard";

export default function ItemGrid({
  items = [],
  loading = false,
  hasMore = true,
  onLoadMore,
}) {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || !onLoadMore) return;

    setLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  };

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
        <a href="/add-listing" className={styles.addListingBtn}>＋ Add listing</a>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}

        {/* Loading skeletons while loading more */}
        {loadingMore && (
          <>
            {[...Array(4)].map((_, index) => (
              <LoadingSkeleton key={`loading-${index}`} />
            ))}
          </>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className={styles.loadMore}>
          <button
            className={styles.loadMoreButton}
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <span className={styles.loadingText}>
                <span className={styles.spinner}></span>
                Loading more...
              </span>
            ) : (
              "Load More Items"
            )}
          </button>
        </div>
      )}

      {/* End message */}
      {!hasMore && items.length > 0 && (
        <div className={styles.endMessage}>
          <p>You have reached the end! 🎉</p>
        </div>
      )}
    </div>
  );
}
