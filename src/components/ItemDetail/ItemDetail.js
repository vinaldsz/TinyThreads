'use client';
// src/components/ItemDetail/ItemDetail.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getItemById } from '../../services/itemService';
import styles from './ItemDetail.module.css';
import Image from 'next/image';
import Navbar from '@/components/Navbar/Navbar';
import PurchaseModal from './PurchaseModal';
import { useSession } from 'next-auth/react';

export default function ItemDetail({ itemId }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { data: session } = useSession();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // ADD THIS CLEANING FUNCTION HERE:
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
    if (!item) return [];

    const rawImages =
      Array.isArray(item.imageUrls) && item.imageUrls.length > 0
        ? item.imageUrls
        : item.imageUrl
          ? [item.imageUrl]
          : [];

    const cleanedImages = rawImages
      .map(cleanImageUrl)
      .filter((url) => url && url !== '/'); // Remove null/invalid URLs

    return cleanedImages; // No placeholder fallback
  }, [item]);

  // reuse
  const fetchItem = useCallback(async () => {
    try {
      const data = await getItemById(itemId);
      setItem(data);
      setCurrentIndex(0);
      if (process.env.NODE_ENV !== 'production') {
        console.log('ItemDetail loaded item:', data);
      }
    } catch (err) {
      console.error('Error fetching item:', err);
    }
  }, [itemId]);

  useEffect(() => {
    const loadItem = async () => {
      setLoading(true);
      await fetchItem();
      setLoading(false);
    };

    if (itemId) loadItem();
  }, [itemId, fetchItem]);

  const handleBack = () => router.back();

  const formatPrice = (p) => {
    const n = typeof p === 'number' ? p : Number(p);
    return Number.isFinite(n) ? n.toFixed(2) : String(p ?? '');
  };

  // purchase button
  const isLoggedIn = !!session;
  const isAvailable = item?.status === 'available';
  const canPurchase = isLoggedIn && isAvailable;

  const handleBuyClick = () => {
    setShowPurchaseModal(true);
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  const handlePurchaseSuccess = async () => {
    console.log('Purchase successful! Refreshing item data...');
    setShowPurchaseModal(false);
    await fetchItem();
    console.log('Item data refreshed. Status:', item?.status);
  };

  const handleContactSeller = () => {
    if (item?.sellerEmail) {
      window.location.href = `mailto:${item.sellerEmail}`;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading item details...</p>
      </div>
    );
  }
  if (!item) {
    return (
      <div className={styles.notFound}>
        <h2>Item Not Found</h2>
        <p>The item you are looking for does not exist or has been removed.</p>
        <button onClick={handleBack} className={styles.backButton}>
          ← Go Back
        </button>
      </div>
    );
  }

  const isDonation = Number(item.price) === 0;
  const conditionKey = (item.condition || '').toLowerCase().replace(/\s/g, '');
  const conditionClass = styles[conditionKey] || '';

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={handleBack} className={styles.backButton}>
            ← Back to Browse
          </button>
        </div>

        <div className={styles.content}>
          {/* Image + Status */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              {images.length > 0 ? (
                <div className={styles.imageFillWrapper}>
                  <Image
                    src={images[currentIndex]}
                    alt={item.title}
                    className={styles.productImage}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ) : (
                <div className={styles.noImage}>No image available</div>
              )}

              {images.length > 1 && (
                <div className={styles.carouselControls}>
                  <button
                    type="button"
                    className={styles.carouselBtn}
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1,
                      )
                    }
                  >
                    ‹
                  </button>

                  <span className={styles.carouselCounter}>
                    {currentIndex + 1}/{images.length}
                  </span>

                  <button
                    type="button"
                    className={styles.carouselBtn}
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1,
                      )
                    }
                  >
                    ›
                  </button>
                </div>
              )}

              <div
                className={`${styles.statusBadge} ${
                  styles[(item.status || '').toLowerCase()]
                }`}
              >
                {item.status === 'available'
                  ? '✓ Available'
                  : item.status || '—'}
              </div>
            </div>
            {images.length > 1 && (
              <div className={styles.thumbnailStrip}>
                {images.map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`${styles.thumbnailBtn} ${idx === currentIndex ? styles.activeThumb : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    <Image
                      src={img}
                      alt={`${item.title} thumbnail ${idx + 1}`}
                      width={64}
                      height={64}
                      className={styles.thumbnailImage}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Core Details (Mongo fields only) */}
          <div className={styles.detailsSection}>
            <div className={styles.productInfo}>
              <h1 className={styles.title}>{item.title}</h1>

              <div className={styles.metaRow}>
                {isDonation && (
                  <span
                    className={`${styles.metaTag} ${styles.metaTagDonation}`}
                  >
                    Donation · Free
                  </span>
                )}
                {item.condition && (
                  <span
                    className={`${styles.metaTag} ${styles.condition} ${conditionClass}`}
                  >
                    Condition: {item.condition}
                  </span>
                )}
              </div>

              <div className={styles.priceRow}>
                <span className={styles.price}>
                  {`$${formatPrice(item.price)}`}
                </span>
              </div>

              <div className={styles.basicInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Size/Age:</span>
                  <span>
                    {item.size || '—'}{' '}
                    {item.ageRange ? `(${item.ageRange})` : ''}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Category:</span>
                  <span>{item.category || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Location:</span>
                  <span>{item.location || '—'}</span>
                </div>
              </div>

              <div className={styles.description}>
                <h3>Description</h3>
                <p>{item.description || '—'}</p>
              </div>

              {/* Purchase Section moved below Description */}
              <div className={styles.purchaseSection}>
                {canPurchase && (
                  <button onClick={handleBuyClick} className={styles.buyButton}>
                    Buy Now
                  </button>
                )}

                {!isLoggedIn && isAvailable && (
                  <button
                    onClick={handleLoginRedirect}
                    className={styles.loginButton}
                  >
                    Sign in to purchase
                  </button>
                )}

                {!isAvailable && (
                  <div className={styles.soldNotice}>
                    This item has been sold
                  </div>
                )}
              </div>
            </div>

            {/* Seller Information */}
            <div className={styles.sellerSection}>
              <h3>Seller Information</h3>
              <div className={styles.sellerCard}>
                <div className={styles.sellerHeader}>
                  <div className={styles.sellerName}>
                    {item.sellerName || 'Seller'}
                  </div>
                </div>
                <div className={styles.sellerMeta}>
                  {item.sellerEmail && (
                    <div className={styles.metaRow}>
                      <strong>Email:</strong>
                      <span>{item.sellerEmail}</span>
                    </div>
                  )}
                </div>

                {item.status === 'available' && item.sellerEmail && (
                  <div className={styles.contactButtons}>
                    <button
                      onClick={handleContactSeller}
                      className={styles.emailButton}
                    >
                      <svg
                        className={styles.emailIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21 7.5l-9 6-9-6"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className={styles.emailText}>
                        <span className={styles.emailTitle}>Email Seller</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.safetyNotice}>
              <h4>🛡️ Safety Tips</h4>
              <ul>
                <li>
                  Meet in a public place like a library, coffee shop, or mall
                </li>
                <li>Bring a friend if possible</li>
                <li>Inspect items carefully before payment</li>
                <li>
                  Trust your instincts — if something feels off, walk away
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Purchase Modal */}
      {showPurchaseModal && (
        <PurchaseModal
          item={item}
          user={session?.user}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </>
  );
}
