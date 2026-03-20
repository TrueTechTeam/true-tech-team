import styles from './Logo.module.scss';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 48,
  md: 80,
  lg: 120,
};

export function Logo({ size = 'md', className }: LogoProps) {
  const dim = SIZES[size];

  return (
    <img
      src="/HotmessLogo.png"
      alt="Hotmess Sports"
      width={dim}
      height={dim}
      className={`${styles.logo} ${className || ''}`}
    />
  );
}
