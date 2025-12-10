'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ returnUrl }) {
  const router = useRouter();
  const handleNavigate = () => {
    if (returnUrl) {
      router.push(returnUrl);
    } else {
      router.back();
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        handleNavigate();
      }}
      style={{
        background: 'white',
        padding: '10px',
        cursor: 'pointer',
        zIndex: 1,
        position: 'relative',
      }}
    >
      ← Back
    </div>
  );
}
