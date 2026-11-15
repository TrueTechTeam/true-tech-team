import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import {
  loadPortfolioPageBySlug,
  recordToPage,
  resolveEffectiveMode,
  ThemedPageView,
} from '@true-tech-team/portfolio-builder';

interface PortfolioPublicPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Sets the document's theme mode before the body paints.
 *
 * The root layout renders `<html data-theme="dark">` for every route, and the library's mode
 * tokens are `:root`-scoped, so without this a light portfolio paints with the dark token block
 * until hydration corrects it. This runs during parse, ahead of the portfolio markup below it, so
 * the first paint already carries the page's own mode. `PageThemeMode` inside `ThemedPageView`
 * then holds that mode through hydration, when the app shell's provider writes `dark` from its
 * mount effect.
 *
 * Returned as one of two fixed literals rather than by interpolating the resolved mode, so there
 * is no way for stored page data to reach the script body.
 */
function themeModeScript(mode: 'light' | 'dark'): string {
  return mode === 'dark'
    ? "document.documentElement.dataset.theme='dark'"
    : "document.documentElement.dataset.theme='light'";
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
    // app's branding. What matters is that these keys are PRESENT: Next's `mergeMetadata` walks
    // the returned object with `for...in`, which visits a key whose value is `undefined` too, and
    // both `undefined` and `null` resolve to "emit nothing" (`description` via `?? null`, `icons`
    // via `resolveIcons`'s falsy check). Only leaving a key out inherits the root layout's value.
    // `null` is chosen over `undefined` because it states the suppression rather than looking like
    // an accidentally unset field. A portfolio page has no description of its own to put here, so
    // it gets none rather than the app's marketing copy.
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

  const page = recordToPage(record);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeModeScript(resolveEffectiveMode(page)) }} />
      <ThemedPageView page={page} />
    </>
  );
}
