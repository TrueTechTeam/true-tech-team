import { notFound } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import {
  loadPortfolioPageBySlug,
  recordToPage,
  ThemedPageView,
} from '@true-tech-team/portfolio-builder';

interface PortfolioPublicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PortfolioPublicPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const record = await loadPortfolioPageBySlug(supabase, slug);
  // Deliberately does not call notFound() here - the page component below is the single
  // source of truth for the 404 decision. A missing record just falls back to a generic title.
  return { title: record?.title ?? 'Portfolio' };
}

export default async function PortfolioPublicPage({ params }: PortfolioPublicPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const record = await loadPortfolioPageBySlug(supabase, slug);

  if (!record) {
    notFound();
  }

  return <ThemedPageView page={recordToPage(record)} />;
}
