'use client';

import Link from 'next/link';
import { Button } from '@true-tech-team/ui-components';

interface Props {
  href: string;
  label?: string;
}

// Client component wrapper — see MembershipBadges.tsx for why this dashboard
// page never imports @true-tech-team/ui-components directly.
export default function OpenAppButton({ href, label = 'Open App' }: Props) {
  return (
    <Link href={href}>
      <Button variant="primary" size="sm">
        {label}
      </Button>
    </Link>
  );
}
