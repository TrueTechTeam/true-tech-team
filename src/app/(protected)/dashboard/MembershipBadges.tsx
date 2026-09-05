'use client';

import { Badge } from '@true-tech-team/react-components';

interface Props {
  isAdmin: boolean;
}

// Rendered as a client component so this Server Component page never imports
// @true-tech-team/react-components directly — that bundle isn't marked "use client"
// internally and crashes when evaluated under the RSC (react-server) condition.
export default function MembershipBadges({ isAdmin }: Props) {
  return (
    <>
      <Badge variant="success">Member</Badge>
      {isAdmin && <Badge variant="warning">Admin</Badge>}
    </>
  );
}
