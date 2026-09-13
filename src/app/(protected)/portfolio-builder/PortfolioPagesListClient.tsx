'use client';

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
  return <PortfolioPagesList pages={pages} userId={userId} supabase={supabase} />;
}
