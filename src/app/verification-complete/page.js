'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function VerificationComplete() {
  const router = useRouter();
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    const syncAndCheckVerification = async () => {
      try {
        // First, sync with Stripe to update our database
        const syncRes = await fetch('/api/stripe/sync-verification', {
          method: 'POST',
        });

        if (!syncRes.ok) {
          // If the user lost auth (401) or any server error, stop looping and show message
          const errData = await syncRes.json().catch(() => ({}));
          throw new Error(errData?.error || 'Failed to sync verification');
        }

        const syncData = await syncRes.json();
        console.log('Sync response:', syncData);

        if (syncData.isVerified) {
          setStatus('verified');
          // Redirect back to home after 3 seconds
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setStatus('pending');
          // Check again after 2 seconds if not yet verified
          setTimeout(syncAndCheckVerification, 2000);
        }
      } catch (err) {
        console.error('Sync error:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    syncAndCheckVerification();
  }, [router]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'verified' && (
          <>
            <div className={styles.successIcon}>✓</div>
            <h1 className={styles.title}>Verification Successful!</h1>
            <p className={styles.message}>
              Your identity has been verified. You can now list items with a
              verified badge.
            </p>
            <p className={styles.redirect}>Redirecting you back...</p>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className={styles.spinner}></div>
            <h1 className={styles.title}>Verifying Your Identity</h1>
            <p className={styles.message}>
              We&apos;re processing your verification. This may take a moment...
            </p>
          </>
        )}

        {status === 'checking' && (
          <>
            <div className={styles.spinner}></div>
            <h1 className={styles.title}>Checking Status</h1>
            <p className={styles.message}>Please wait...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className={styles.errorIcon}>✕</div>
            <h1 className={styles.title}>Something Went Wrong</h1>
            <p className={styles.message}>
              {error || 'Failed to check verification status.'}
            </p>
            <button className={styles.button} onClick={() => router.push('/')}>
              Go Back Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
