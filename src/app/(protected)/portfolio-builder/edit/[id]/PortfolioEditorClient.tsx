'use client';

import { createClient } from '../../../../../lib/supabase/client';
import { PortfolioEditor } from '@true-tech-team/portfolio-builder';

export function PortfolioEditorClient({ pageId, userId }: { pageId: string; userId: string }) {
  const supabase = createClient();
  return <PortfolioEditor pageId={pageId} userId={userId} supabase={supabase} />;
}
