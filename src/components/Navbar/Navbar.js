'use client';
import styles from './Navbar.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import VerificationModal from '@/components/VerificationModal/VerificationModal';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [userVerified, setUserVerified] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    // Check verification status
    if (session?.user?.id) {
      const checkStatus = () => {
        fetch('/api/stripe/verification-status', { cache: 'no-store' })
          .then((res) => res.json())
          .then((data) => setUserVerified(data.isVerified))
          .catch((err) =>
            console.error('Failed to check verification status:', err),
          );
      };

      checkStatus();

      // Re-check when window gains focus (after returning from Stripe)
      const handleFocus = () => checkStatus();
      // Listen for custom event from verification-complete page
      const handleVerificationComplete = () => checkStatus();

      window.addEventListener('focus', handleFocus);
      window.addEventListener(
        'verification-complete',
        handleVerificationComplete,
      );

      return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener(
          'verification-complete',
          handleVerificationComplete,
        );
      };
    }
  }, [session]);

  useEffect(() => {
    function handleDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleDoc);
    return () => document.removeEventListener('mousedown', handleDoc);
  }, []);

  return (
    <nav
      className={styles.navbar}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* brand sits outside the centered .inner so it can be flush to the viewport left */}
      <div className={styles.brandWrapper}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandLink}>
            <Image
              src="/TinyThreadsScribble_new.png"
              alt="TinyThreads"
              className={styles.brandLogo}
              width={1000}
              height={1000}
            />
          </Link>
        </div>
      </div>

      <div className={styles.inner}>
        <div className={styles.spacer} />
        <div className={styles.rightWrapper}>
          <div className={styles.links} ref={menuRef}>
            <Link href="/" className={styles.aboutLink}>
              Home
            </Link>
            <Link href="/about" className={styles.aboutLink}>
              About
            </Link>

            {status === 'loading' ? null : session ? (
              <div className={styles.profileWrap}>
                {!userVerified && (
                  <button
                    onClick={() => setShowVerificationModal(true)}
                    className={styles.verifyButton}
                    type="button"
                  >
                    ✓ Verify Account
                  </button>
                )}
                <button
                  className={styles.profileButton}
                  aria-haspopup="true"
                  aria-expanded={open}
                  onClick={() => setOpen((v) => !v)}
                  type="button"
                >
                  <span className={styles.userName}>
                    {session.user?.name || session.user?.email}
                  </span>
                  <span className={styles.caret}>▾</span>
                </button>

                {open && (
                  <div className={styles.profileDropdown} role="menu">
                    <Link
                      href="/profile"
                      className={styles.dropdownItem}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      Profile
                    </Link>

                    <Link href="/my-listings" className={styles.dropdownItem}>
                      <span className={styles.dropdownIcon}></span>
                      My Listings
                    </Link>

                    <Link href="/my-purchases" className={styles.dropdownItem}>
                      <span className={styles.dropdownIcon}></span>
                      My Purchases
                    </Link>

                    <Link href="/favorites" className={styles.dropdownItem}>
                      <span className={styles.dropdownIcon}></span>
                      Favorites
                    </Link>

                    <button
                      className={styles.dropdownItem}
                      role="menuitem"
                      onClick={() => signOut({ callbackUrl: '/' })}
                      type="button"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className={styles.aboutLink}>
                  Log in
                </Link>
                <Link href="/signup" className={styles.aboutLink}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {showVerificationModal && (
        <VerificationModal
          onClose={() => setShowVerificationModal(false)}
          onVerified={() => setUserVerified(true)}
        />
      )}
    </nav>
  );
}
