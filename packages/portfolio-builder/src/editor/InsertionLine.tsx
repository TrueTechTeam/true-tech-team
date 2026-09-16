import styles from './InsertionLine.module.scss';

export interface InsertionLineProps {
  orientation: 'vertical' | 'horizontal';
  offset: number;
}

export function InsertionLine({ orientation, offset }: InsertionLineProps) {
  const style = orientation === 'vertical' ? { left: `${offset}px` } : { top: `${offset}px` };
  const orientationClass = orientation === 'vertical' ? styles.vertical : styles.horizontal;

  return (
    <div
      data-testid="insertion-line"
      className={`${styles.line} ${orientationClass}`}
      style={style}
    />
  );
}
