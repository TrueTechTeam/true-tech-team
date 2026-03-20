import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './ImageCard.module.scss';

interface ImageCardProps {
  imageUrl: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  href?: string;
  children?: ReactNode;
  className?: string;
}

export function ImageCard({
  imageUrl,
  imageAlt,
  title,
  subtitle,
  badge,
  badgeColor,
  href,
  children,
  className,
}: ImageCardProps) {
  const content = (
    <>
      <div className={styles.backgroundImage}>
        <img src={imageUrl} alt={imageAlt} loading="lazy" />
      </div>
      <div className={styles.overlay} />
      <div className={styles.content}>
        {badge && (
          <span
            className={styles.badge}
            style={badgeColor ? { backgroundColor: badgeColor } : undefined}
          >
            {badge}
          </span>
        )}
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </>
  );

  if (href) {
    return (
      <Link to={href} className={`${styles.card} ${className || ''}`}>
        {content}
      </Link>
    );
  }

  return <div className={`${styles.card} ${className || ''}`}>{content}</div>;
}
