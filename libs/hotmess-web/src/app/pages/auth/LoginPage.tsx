import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './LoginPage.module.scss';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithSportsEngine, isAuthenticated, loading } = useAuth();

  // Get error from URL if present
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get('error');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location.state]);

  const handleSportsEngineLogin = () => {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';
    signInWithSportsEngine(from);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <p className={styles.loadingText}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>Hotmess Sports</span>
        </Link>

        <div className={styles.card}>
          <h1 className={styles.title}>Welcome</h1>
          <p className={styles.subtitle}>Sign in with your Sports Engine account to continue</p>

          {error && (
            <p className={styles.error}>
              {error === 'auth_failed'
                ? 'Authentication failed. Please try again.'
                : 'An error occurred. Please try again.'}
            </p>
          )}

          <button onClick={handleSportsEngineLogin} className={styles.loginButton}>
            Sign in with Sports Engine
          </button>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <p className={styles.signupText}>
            {"Don't have a Sports Engine account? "}
            <a
              href="https://user.sportsengine.com/users/sign_up"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.signupLink}
            >
              Create one here
            </a>
          </p>
        </div>

        <p className={styles.footer}>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
