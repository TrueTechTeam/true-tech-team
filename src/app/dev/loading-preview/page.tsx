import { notFound } from 'next/navigation';
import RouteLoading from '../../../components/layout/RouteLoading';

export const metadata = { title: 'Loading Preview (dev)' };

// Dev-only sandbox for tweaking RouteLoading's animation without having to
// log in and navigate a real protected route to trigger it. 404s in
// production builds so it never ships as a real page.
export default function LoadingPreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <RouteLoading message="Loading Recipe AI Agent…" />;
}
