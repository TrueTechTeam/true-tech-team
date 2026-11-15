import type { Metadata } from 'next';
import { Providers } from '../components/Providers';
import '@true-tech-team/react-components/index.css';
import './globals.scss';

// Declared as Next.js metadata rather than literal <head> children. A route-level
// `generateMetadata` can only override the metadata object: raw <head> children are emitted
// alongside it, so a hardcoded <title>/<meta name="description">/<link rel="icon"> here leaked the
// app's own branding onto every route, published portfolios included. The values are unchanged, so
// every other route still renders the same title, description and icon.
export const metadata: Metadata = {
  title: 'True Tech Team - Tech Project Portfolio',
  description: 'Showcasing innovative tech projects and solutions from the True Tech Team',
  icons: { icon: { url: '/logo.svg', type: 'image/svg+xml' } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `suppressHydrationWarning` covers this element's own attributes only, not its subtree. It is
    // here because `data-theme` below is deliberately rewritten before React hydrates: a published
    // portfolio at /p/<slug> emits an inline script that sets the page's own mode so the first
    // paint is not the app's dark. React then finds the attribute changed from what the server
    // sent and logs a hydration mismatch on every light-themed portfolio - measured: 0 errors on a
    // route with no script, 1 on a light page, 0 on a dark one, where the script agrees with the
    // server. The client value is the one we want and React keeps it, so the warning is noise.
    <html lang="en" data-scroll-behavior="smooth" data-theme="dark" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
