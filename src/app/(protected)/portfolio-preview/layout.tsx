import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';

// Bare auth-redirect-only layout. This route carries zero app chrome (no Header, Footer or
// ProjectGate) ONLY because it is a SIBLING of portfolio-builder/, not a child. In the App Router
// a parent layout always wraps its children, so nesting this under portfolio-builder/ renders
// that layout's Header/Footer inside the preview iframe no matter what this file does. There is
// no (protected)/layout.tsx, so a sibling inherits nothing - the same reason resume-print/ is
// chrome-free. Do not move this under portfolio-builder/.
// It renders only what its parent posts via postMessage (PortfolioPreviewReceiver), so it needs
// the login redirect but not the per-app permission gate.
export default async function PortfolioPreviewLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return children;
}
