import { redirect } from 'next/navigation';

// Applications are now part of the combined Overview page, not its own tab —
// redirect anyone who had this route bookmarked.
export default function JobSearchApplicationsPage() {
  redirect('/job-search');
}
