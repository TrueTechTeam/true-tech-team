import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './LoginPage.module.scss';

export function OAuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The AuthContext handles the OAuth callback automatically
    // This page just shows a loading state while that happens

    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');

    if (errorParam) {
      setError(errorParam);
    }
  }, []);

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}>Authentication Error</h1>
            <p className={styles.error}>
              {error === 'access_denied'
                ? 'Access was denied. Please try again.'
                : 'An error occurred during authentication.'}
            </p>
            <Link to="/login" className={styles.loginButton}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Signing you in...</h1>
          <p className={styles.subtitle}>Please wait while we complete your authentication.</p>
          <div className={styles.loader} />
        </div>
      </div>
    </div>
  );
}
