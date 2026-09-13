import { redirect } from 'next/navigation';
import { createClient } from '../../../../../lib/supabase/server';
import { PortfolioEditorClient } from './PortfolioEditorClient';

export default async function PortfolioBuilderEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <PortfolioEditorClient pageId={id} userId={user.id} />;
}
