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
    <html lang="en" data-scroll-behavior="smooth" data-theme="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
