'use client';

import { Icon } from '@true-tech-team/react-components';
import styles from './FavoriteHeartButton.module.scss';

interface FavoriteHeartButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  'aria-label'?: string;
}

const PINK = '#ec4899';

export default function FavoriteHeartButton({
  isFavorite,
  onToggle,
  size = 'md',
  disabled,
  'aria-label': ariaLabel,
}: FavoriteHeartButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={isFavorite}
      aria-label={ariaLabel ?? (isFavorite ? 'Remove from favorites' : 'Add to favorites')}
    >
      <Icon
        name={isFavorite ? 'heart-filled' : 'heart'}
        size={size}
        color={isFavorite ? PINK : 'currentColor'}
      />
    </button>
  );
}
