import type { Metadata } from 'next';
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

export async function generateMetadata({ params }: PortfolioPublicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const record = await loadPortfolioPageBySlug(supabase, slug);
  // Deliberately does not call notFound() here - the page component below is the single
  // source of truth for the 404 decision. A missing record just falls back to a generic title.
  return {
    title: record?.title ?? 'Portfolio',
    // A published portfolio belongs to its owner, not to this app, so it carries none of the
    // app's branding. `null` is what removes an inherited field in Next.js - omitting these
    // (or setting them to undefined) would let the root layout's description and favicon
    // through. A portfolio page has no description of its own to put here, so it gets none
    // rather than the app's marketing copy.
    description: null,
    icons: null,
  };
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
