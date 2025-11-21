'use client';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styles from './PurchaseModal.module.css';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Payment Form Component (for Step 2)
function PaymentForm({ item, user, onSuccess, onError, onBack }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Step 1: Create payment intent
      const paymentIntentResponse = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item._id,
          price: item.price
        })
      });

      const { clientSecret, paymentIntentId } = await paymentIntentResponse.json();

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user.name,
            email: user.email,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Step 3: Create transaction record
      const transactionResponse = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item._id,
          stripePaymentId: paymentIntent.id
        })
      });

      if (!transactionResponse.ok) {
        const errorData = await transactionResponse.json();
        throw new Error(errorData.error || 'Transaction failed');
      }

      // Success!
      onSuccess({
        orderId: paymentIntent.id,
        item: item,
        user: user
      });

    } catch (error) {
      console.error('Payment error:', error);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <div className={styles.itemSummarySmall}>
        <img src={item.imageUrl} alt={item.title} className={styles.itemImageSmall} />
        <div className={styles.itemInfoSmall}>
          <h4>{item.title}</h4>
          <p className={styles.priceSmall}>${item.price}</p>
        </div>
      </div>

      <div className={styles.cardSection}>
        <h4>Card Number</h4>
        <div className={styles.cardElementContainer}>
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
        <p className={styles.poweredBy}>Powered by Stripe</p>
      </div>

      <div className={styles.actions}>
        <button 
          type="button" 
          onClick={onBack}
          className={styles.backButton}
          disabled={loading}
        >
          Back
        </button>
        <button 
          type="submit"
          className={styles.purchaseButton}
          disabled={!stripe || loading}
        >
          {loading ? 'Processing...' : 'Complete Purchase'}
        </button>
      </div>
    </form>
  );
}

// Main Modal Component
export default function PurchaseModal({ item, user, onClose }) {
  const [modalStep, setModalStep] = useState('confirmation');
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleProceedToPayment = () => {
    setModalStep('payment');
  };

  const handlePaymentSuccess = (data) => {
    setOrderData(data);
    setModalStep('success');
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    setModalStep('error');
  };

  const handleBackToConfirmation = () => {
    setModalStep('confirmation');
    setError(null);
  };

  // Generate a simple order ID for display
  const generateOrderId = () => {
    return orderData?.orderId?.slice(-8).toUpperCase() || 'TTL' + Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        
        {/* STEP 1: CONFIRMATION */}
        {modalStep === 'confirmation' && (
          <>
            <div className={styles.header}>
              <h2>Confirm Purchase</h2>
              <button className={styles.closeButton} onClick={onClose}>×</button>
            </div>
            <div className={styles.content}>
              <div className={styles.itemSummary}>
                <img src={item.imageUrl} alt={item.title} className={styles.itemImage} />
                <div className={styles.itemInfo}>
                  <h3>{item.title}</h3>
                  <div className={styles.price}>${item.price}</div>
                  <p>Condition: {item.condition || 'Like New'}</p>
                  <p>Age Range: {item.ageRange || '6-12 months'}</p>
                </div>
              </div>

              <div className={styles.sellerInfo}>
                <div className={styles.sellerAvatar}>SJ</div>
                <div>
                  <p>Sold by</p>
                  <p><strong>Sarah Johnson</strong></p>
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.cancelButton} onClick={onClose}>
                  Cancel
                </button>
                <button className={styles.proceedButton} onClick={handleProceedToPayment}>
                  Proceed to Payment
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 2: PAYMENT */}
        {modalStep === 'payment' && (
          <>
            <div className={styles.header}>
              <h2>Payment Details</h2>
              <button className={styles.closeButton} onClick={onClose}>×</button>
            </div>
            <div className={styles.content}>
              <Elements stripe={stripePromise}>
                <PaymentForm
                  item={item}
                  user={user}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onBack={handleBackToConfirmation}
                />
              </Elements>
            </div>
          </>
        )}

        {/* STEP 3: SUCCESS */}
        {modalStep === 'success' && (
          <>
            <div className={styles.header}>
              <h2>Purchase Complete!</h2>
            </div>
            <div className={styles.content}>
              <div className={styles.successIcon}>✅</div>
              <h3>Your order has been confirmed and is on its way.</h3>
              
              <div className={styles.orderDetails}>
                <div className={styles.orderRow}>
                  <span>Order ID</span>
                  <span>{generateOrderId()}</span>
                </div>
                <div className={styles.orderRow}>
                  <span>Item</span>
                  <span>{item.title}</span>
                </div>
                <div className={styles.orderRow}>
                  <span>Total</span>
                  <span>${item.price}</span>
                </div>
                <div className={styles.orderRow}>
                  <span>Seller</span>
                  <span>Sarah Johnson</span>
                </div>
              </div>

              <button className={styles.doneButton} onClick={onClose}>
                Done
              </button>
            </div>
          </>
        )}

        {/* ERROR STATE */}
        {modalStep === 'error' && (
          <>
            <div className={styles.header}>
              <h2>Payment Failed</h2>
              <button className={styles.closeButton} onClick={onClose}>×</button>
            </div>
            <div className={styles.content}>
              <div className={styles.errorIcon}>❌</div>
              <h3>Payment Failed</h3>
              <p className={styles.errorMessage}>{error}</p>
              
              <div className={styles.actions}>
                <button className={styles.cancelButton} onClick={onClose}>
                  Cancel
                </button>
                <button className={styles.tryAgainButton} onClick={handleBackToConfirmation}>
                  Try Again
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}