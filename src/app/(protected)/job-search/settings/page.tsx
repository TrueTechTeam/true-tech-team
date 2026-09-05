import { redirect } from 'next/navigation';

// Settings is now a dialog opened from the header (JobSearchHeader), not its
// own view — redirect anyone who had this route bookmarked.
export default function JobSearchSettingsPage() {
  redirect('/job-search');
}
