'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';
import { PortfolioPagesList, type PortfolioPageRecord } from '@true-tech-team/portfolio-builder';

export function PortfolioPagesListClient({
  pages,
  userId,
}: {
  pages: PortfolioPageRecord[];
  userId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  return (
    <PortfolioPagesList
      pages={pages}
      userId={userId}
      supabase={supabase}
      onCreated={(record) => router.push(`/portfolio-builder/edit/${record.id}`)}
    />
  );
}
