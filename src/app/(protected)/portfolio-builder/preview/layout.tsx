import { redirect } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/server';

// Bare auth-redirect-only layout — the live preview route must carry zero app
// chrome (no Header/Footer/ProjectGate), matching resume-print/layout.tsx's
// reasoning exactly: a page preview should never show dashboard chrome inside
// the iframe.
export default async function PortfolioBuilderPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return children;
}
