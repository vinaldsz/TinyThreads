'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ returnUrl }) {
  const router = useRouter();
  console.log('return Url in Back', returnUrl);
  const handleNavigate = () => {
    if (returnUrl) {
      console.log('Navigating to:', returnUrl);
      router.push(returnUrl);
    } else {
      console.log('Using router.back()');
      router.back();
    }
  };

  return <div onClick={handleNavigate}>← Back</div>;
}
