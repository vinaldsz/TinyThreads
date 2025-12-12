'use client';

import { useState, useEffect } from 'react';
import styles from './VerificationModal.module.css';

export default function VerificationModal({ onClose, onVerified }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Load Stripe.js
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const handleStartVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create verification session on server
      const res = await fetch('/api/stripe/create-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isVerified) {
          setIsVerified(true);
          setLoading(false);
          return;
        }
        throw new Error(
          data.detail || data.error || 'Failed to create verification session',
        );
      }

      const { verificationUrl } = data;
      if (!verificationUrl) throw new Error('No verification URL returned');

      // Redirect user to Stripe-hosted verification page
      window.location.href = verificationUrl;

      // The user completes verification on Stripe and is redirected to return_url
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Verify Your Account</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {isVerified ? (
            <div className={styles.successContainer}>
              <div className={styles.successBadge}>✓</div>
              <h3>Verification Complete!</h3>
              <p>
                Your account has been verified. You can now list items with a
                verified badge.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.description}>
                <p>
                  Verify your identity to build trust with buyers and unlock
                  seller features. This process is secure and takes about 2-3
                  minutes.
                </p>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.requirements}>
                <h4>You&apos;ll need:</h4>
                <ul>
                  <li>
                    A valid government-issued ID (Passport, Driver&apos;s
                    License, etc.)
                  </li>
                  <li>A webcam or camera</li>
                  <li>Good lighting</li>
                </ul>
              </div>

              <button
                onClick={handleStartVerification}
                disabled={loading}
                className={styles.verifyButton}
              >
                {loading ? 'Starting verification...' : 'Start Verification'}
              </button>

              <p className={styles.privacy}>
                Your information is encrypted and secure. Stripe handles all
                data according to their privacy policy.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
