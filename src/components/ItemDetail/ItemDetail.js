'use client';
// src/components/ItemDetail/ItemDetail.js
import { useState, useEffect } from 'react';
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
  const { data: session } = useSession()
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await getItemById(itemId); // calls /api/items/:id
        setItem(data);
        setCurrentIndex(0);
        if (process.env.NODE_ENV !== 'production') {
          console.log('ItemDetail loaded item:', data);
        }
      } catch (err) {
        console.error('Error fetching item:', err);
      } finally {
        setLoading(false);
      }
    };
    if (itemId) fetchItem();
  }, [itemId]);

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

  const images =
    Array.isArray(item.imageUrls) && item.imageUrls.length > 0
      ? item.imageUrls
      : item.imageUrl
        ? [item.imageUrl]
        : [];

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
                <Image
                  src={images[currentIndex]}
                  alt={item.title}
                  className={styles.productImage}
                  width={400}
                  height={400}
                />
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

            <div className={styles.priceAndCondition}>
              <span className={styles.price}>${formatPrice(item.price)}</span>
              {(() => {
                const raw = (item.condition ?? '').toString().trim();
                const key = raw.toLowerCase().replace(/\s+/g, '');
                const hasVariantClass = key && styles[key];
                return (
                  <span
                    className={`${styles.condition} ${
                      hasVariantClass ? styles[key] : ''
                    }`}
                  >
                    {raw || '—'}
                  </span>
                );
              })()}
            </div>

            {/* NEW: Purchase Button Section */}
            <div className={styles.purchaseSection}>
              {canPurchase && (
                <button 
                  onClick={handleBuyClick}
                  className={styles.buyButton}
                >
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
            </div>

            {/* Seller Information — commented out for this sprint */}
            {/*
            <div className={styles.sellerSection}>
              <h3>Seller Information</h3>
              <div className={styles.sellerCard}>
                <div className={styles.sellerHeader}>
                  <div className={styles.sellerName}>{item.sellerName || 'Seller'}</div>
                </div>
                <div className={styles.sellerMeta}>
                  <span className={styles.location}>{item.location}</span>
                </div>

                {(item.status === 'available') && (item.sellerEmail || item.sellerPhone) && (
                  <div className={styles.contactButtons}>
                    {item.sellerEmail && (
                      <button onClick={handleContactSeller} className={styles.emailButton}>📧 Email Seller</button>
                    )}
                    {item.sellerPhone && (
                      <button onClick={handleCallSeller} className={styles.phoneButton}>📞 Call Seller</button>
                    )}
                  </div>
                )}
              </div>
            </div>
            */}

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
        />
      )}

    </div>
  );
}
