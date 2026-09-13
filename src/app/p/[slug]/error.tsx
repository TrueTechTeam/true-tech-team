'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Something went wrong</h2>
      <p>We couldn&apos;t load this page. Please try again.</p>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
