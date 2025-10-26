"use client";
// src/components/ItemDetail/ItemDetail.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getItemById } from '../../services/itemService';
import styles from './ItemDetail.module.css';

export default function ItemDetail({ itemId }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await getItemById(itemId); // calls /api/items/:id
        setItem(data);
        if (process.env.NODE_ENV !== 'production') console.log('ItemDetail loaded item:', data);
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
        <p>The item you're looking for doesn't exist or has been removed.</p>
        <button onClick={handleBack} className={styles.backButton}>← Go Back</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>← Back to Browse</button>
      </div>

      <div className={styles.content}>
        {/* Image + Status */}
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className={styles.productImage} />
            ) : (
              <div className={styles.noImage}>No image available</div>
            )}
          </div>
          <div className={`${styles.statusBadge} ${styles[(item.status || '').toLowerCase()]}`}>
            {item.status === 'available' ? '✓ Available' : (item.status || '—')}
          </div>
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
                  <span className={`${styles.condition} ${hasVariantClass ? styles[key] : ''}`}>
                    {raw || '—'}
                  </span>
                );
              })()}
            </div>

            <div className={styles.basicInfo}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Size/Age:</span>
                <span>
                  {item.size || '—'} {item.ageRange ? `(${item.ageRange})` : ''}
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
              <li>Meet in a public place like a library, coffee shop, or mall</li>
              <li>Bring a friend if possible</li>
              <li>Inspect items carefully before payment</li>
              <li>Trust your instincts — if something feels off, walk away</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}