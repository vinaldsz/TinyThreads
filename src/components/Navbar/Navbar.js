'use client';
import styles from './Navbar.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

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
              src="/TinyThreadsScribble.png"
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
                <Link href="/login" className={styles.linkButton}>
                  Log in
                </Link>
                <Link href="/signup" className={styles.signupButton}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
