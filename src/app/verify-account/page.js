'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import VerificationModal from '@/components/VerificationModal/VerificationModal';
import styles from './page.module.css';

export default function VerifyAccountPage() {
  const router = useRouter();
  const { status } = useSession();
  const [showModal, setShowModal] = useState(
    typeof window !== 'undefined' ? true : false,
  );

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleClose = () => {
    setShowModal(false);
    router.push('/profile');
  };

  const handleVerified = () => {
    router.push('/profile');
  };

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <h1>Identity Verification</h1>
        <p>Please complete the verification process in the modal.</p>
      </div>
      {showModal && (
        <VerificationModal onClose={handleClose} onVerified={handleVerified} />
      )}
    </>
  );
}
