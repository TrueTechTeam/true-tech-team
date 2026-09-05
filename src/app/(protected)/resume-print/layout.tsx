import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';

// Bare auth-redirect-only layout — a print view must carry zero app chrome
// (no Header/Footer/ProjectGate), so this intentionally does not mirror the
// other route-group layouts in this app.
export default async function ResumePrintLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return children;
}
