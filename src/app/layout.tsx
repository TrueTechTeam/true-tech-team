import { Providers } from '../components/Providers';
import '@true-tech-team/react-components/index.css';
import './globals.scss';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" data-theme="dark">
      <head>
        <title>True Tech Team - Tech Project Portfolio</title>
        <meta
          name="description"
          content="Showcasing innovative tech projects and solutions from the True Tech Team"
        />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
