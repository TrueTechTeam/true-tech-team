import styles from './RouteLoading.module.scss';

interface RouteLoadingProps {
  message?: string;
}

// Rendered via Next.js's loading.tsx convention: shown instantly on navigation
// while the target route segment's server component (auth + permission checks)
// resolves, then swapped out for the real page content automatically.
//
// The animation is pure CSS (no client JS, no portal) so it's already playing
// in the server-rendered HTML the moment it paints — nothing to wait on.
export default function RouteLoading({ message = 'Loading…' }: RouteLoadingProps) {
  return (
    <div className={styles.container}>
      <div className={styles.logoWrap}>
        <div className={styles.glow} aria-hidden="true" />
        <svg className={styles.logo} viewBox="0 0 512 512" role="img" aria-label="True Tech Team">
          <rect width="512" height="512" rx="48" fill="#00adb5" />
          <g fill="#ffffff">
            <g className={styles.letter}>
              <rect x="86" y="311" width="130" height="40" />
              <rect x="131" y="350" width="40" height="130" />
            </g>
            <g className={styles.letter}>
              <rect x="222" y="311" width="130" height="40" />
              <rect x="267" y="350" width="40" height="130" />
            </g>
            <g className={styles.letter}>
              <rect x="358" y="311" width="130" height="40" />
              <rect x="403" y="350" width="40" height="130" />
            </g>
          </g>
        </svg>
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
