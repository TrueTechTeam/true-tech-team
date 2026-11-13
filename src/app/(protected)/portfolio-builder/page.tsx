import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { listPortfolioPages } from '@true-tech-team/portfolio-builder';
import { PortfolioPagesListClient } from './PortfolioPagesListClient';

export default async function PortfolioBuilderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const pages = await listPortfolioPages(supabase, user.id);

  return <PortfolioPagesListClient pages={pages} userId={user.id} />;
}
