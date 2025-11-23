'use client';
import { useState } from 'react';
import Image from 'next/image';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styles from './PurchaseModal.module.css';

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Main PurchaseModal Component
function PurchaseModal({ item, onClose, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirmPurchase = async () => {
    setLoading(true);
    setPurchaseError(null); // Clear any previous errors

    try {
      // Create transaction
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item._id,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      // Show success within modal
      setPurchaseSuccess(true);

      //wait 2 seconds and then refresh the page
      setTimeout(() => {
        if (onSuccess){
          onSuccess();
        }
      }, 2000);
    
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseError(error.message);
      if (onError) {
        onError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>
            {purchaseSuccess ? 'Purchase Confirmed!' : 
             purchaseError ? 'Purchase Failed' : 
             'Confirm Purchase'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.content}>
          {purchaseSuccess ? (
            // Success View
            <>
              <div className={styles.successIcon}>✅</div>
              <h3>Purchase confirmed!</h3>
              
              <div className={styles.orderDetails}>
                <div className={styles.orderRow}>
                  <span>Item:</span>
                  <span>{item.title}</span>
                </div>
                <div className={styles.orderRow}>
                  <span>Price:</span>
                  <span>${item.price}</span>
                </div>
                <div className={styles.orderRow}>
                  <span>Condition:</span>
                  <span>{item.condition}</span>
                </div>
                <div className={styles.orderRow}>
                  <span>Location:</span>
                  <span>{item.location}</span>
                </div>
              </div>

              <p style={{textAlign: 'center', color: '#666', marginBottom: '24px'}}>
                Contact the seller to arrange payment and pickup.
              </p>

              <button onClick={onClose} className={styles.doneButton}>
                Done
              </button>
            </>
          ) : purchaseError ? (
            // Error View
            <>
              <div className={styles.errorIcon}>❌</div>
              <h3>Purchase Failed</h3>
              
              <div className={styles.errorMessage}>
                {purchaseError}
              </div>

              <div className={styles.actions}>
                <button onClick={onClose} className={styles.cancelButton}>
                  Close
                </button>
                <button 
                  onClick={() => {
                    setPurchaseError(null);
                    // This will show the confirmation view again
                  }}
                  className={styles.tryAgainButton}
                >
                  Try Again
                </button>
              </div>
            </>
          ) : (
            // Confirmation View
            <>
              {/* Item summary */}
              <div className={styles.itemSummary}>
                <Image
                  src={item.imageUrls?.[0] || item.imageUrl || '/placeholder-image.jpg'} 
                  alt={item.title}
                  className={styles.itemImage}
                  width={120}
                  height={120}
                />
                <div className={styles.itemInfo}>
                  <h3>{item.title}</h3>
                  <div className={styles.price}>${item.price}</div>
                  <p>Condition: {item.condition}</p>
                  <p>Location: {item.location}</p>
                </div>
              </div>

              {/* Confirmation actions */}
              <div className={styles.actions}>
                <button onClick={onClose} className={styles.cancelButton}>
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmPurchase}
                  disabled={loading}
                  className={styles.proceedButton}
                >
                  {loading ? 'Confirming...' : 'Confirm Purchase'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Export the main component as default
export default PurchaseModal;