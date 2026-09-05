'use client';

import { useRouter } from 'next/navigation';
import { IconButton } from '@true-tech-team/react-components';

export default function BackButton() {
  const router = useRouter();
  return (
    <IconButton icon="arrow-left" aria-label="Back" variant="ghost" onClick={() => router.back()} />
  );
}
