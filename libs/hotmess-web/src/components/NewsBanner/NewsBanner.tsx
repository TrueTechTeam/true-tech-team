import { Link } from 'react-router-dom';
import styles from './NewsBanner.module.scss';

interface NewsBannerProps {
  message: string;
  ctaText?: string;
  ctaLink?: string;
  onDismiss?: () => void;
}

export function NewsBanner({ message, ctaText, ctaLink, onDismiss }: NewsBannerProps) {
  return (
    <div className={styles.banner} role="banner">
      <p className={styles.message}>
        {message}
        {ctaText && ctaLink && (
          <Link to={ctaLink} className={styles.cta}>
            {ctaText} &rarr;
          </Link>
        )}
      </p>
      {onDismiss && (
        <button
          className={styles.dismissButton}
          onClick={onDismiss}
          aria-label="Dismiss announcement"
        >
          &times;
        </button>
      )}
    </div>
  );
}
