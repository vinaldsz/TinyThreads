"use client";
// src/components/ItemDetail.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getItems } from '../../services/itemService';
import styles from './ItemDetail.module.css';

export default function ItemDetail({ itemId }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await getItems();
        const foundItem = response.items.find(item => item.id === itemId);
        setItem(foundItem);
      } catch (error) {
        console.error('Error fetching item:', error);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  const handleContactSeller = () => {
    if (item?.seller?.email) {
      const subject = encodeURIComponent(`Interested in ${item.title}`);
      const body = encodeURIComponent(`Hi ${item.seller.name},\n\nI'm interested in your ${item.title} listed for $${item.price}. Is it still available?\n\nThanks!`);
      window.location.href = `mailto:${item.seller.email}?subject=${subject}&body=${body}`;
    }
  };

  const handleCallSeller = () => {
    if (item?.seller?.phone) {
      window.location.href = `tel:${item.seller.phone}`;
    }
  };

  const handleBack = () => {
    router.back();
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
        <button onClick={handleBack} className={styles.backButton}>
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          ← Back to Browse
        </button>
      </div>

      <div className={styles.content}>
        {/* Image Section */}
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className={styles.productImage}
            />
          </div>
          
          {/* Status Badge */}
          <div className={`${styles.statusBadge} ${styles[item.status]}`}>
            {item.status === 'available' ? '✓ Available' : 'Sold'}
          </div>
        </div>

        {/* Details Section */}
        <div className={styles.detailsSection}>
          <div className={styles.productInfo}>
            <h1 className={styles.title}>{item.title}</h1>
            
            <div className={styles.priceAndCondition}>
              <span className={styles.price}>${item.price}</span>
              <span className={`${styles.condition} ${styles[item.condition.toLowerCase().replace(' ', '')]}`}>
                {item.condition}
              </span>
            </div>

            <div className={styles.basicInfo}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Size/Age:</span>
                <span>{item.size} ({item.ageRange})</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Category:</span>
                <span>{item.category}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Location:</span>
                <span>{item.location}</span>
              </div>
            </div>

            <div className={styles.description}>
              <h3>Description</h3>
              <p>{item.description}</p>
            </div>
          </div>

          {/* Seller Info Section */}
          <div className={styles.sellerSection}>
            <h3>Seller Information</h3>
            
            <div className={styles.sellerCard}>
              <div className={styles.sellerHeader}>
                <div className={styles.sellerName}>
                  {item.seller.name}
                </div>
                <div className={styles.sellerRating}>
                  <span className={styles.stars}>
                    {'★'.repeat(Math.floor(item.seller.rating))}
                    {'☆'.repeat(5 - Math.floor(item.seller.rating))}
                  </span>
                  <span className={styles.ratingNumber}>
                    {item.seller.rating}/5.0
                  </span>
                </div>
              </div>
              
              <div className={styles.sellerMeta}>
                <span>Member since {new Date(item.seller.joinDate).toLocaleDateString()}</span>
                <span className={styles.location}>{item.location}</span>
              </div>

              {item.status === 'available' && (
                <div className={styles.contactButtons}>
                  <button 
                    onClick={handleContactSeller}
                    className={styles.emailButton}
                  >
                    📧 Email Seller
                  </button>
                  <button 
                    onClick={handleCallSeller}
                    className={styles.phoneButton}
                  >
                    📞 Call Seller
                  </button>
                </div>
              )}

              {item.status !== 'available' && (
                <div className={styles.soldMessage}>
                  <p>This item is no longer available</p>
                </div>
              )}
            </div>
          </div>

          {/* Safety Notice */}
          <div className={styles.safetyNotice}>
            <h4>🛡️ Safety Tips</h4>
            <ul>
              <li>Meet in a public place like a library, coffee shop, or mall</li>
              <li>Bring a friend if possible</li>
              <li>Inspect items carefully before payment</li>
              <li>Trust your instincts - if something feels off, walk away</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}