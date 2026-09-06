import styles from './Heading.module.scss';

export interface HeadingItemProps {
  text: string;
  level?: 1 | 2 | 3 | 4;
  align?: 'left' | 'center' | 'right';
}

export function validateHeadingProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.text !== 'string' || props.text.length === 0) {
    errors.push('text is required and must be a string');
  }
  return errors;
}

const LEVEL_TAGS = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4' } as const;

export function HeadingItem(props: Record<string, unknown>) {
  const text = typeof props.text === 'string' ? props.text : '';
  const level =
    props.level === 1 || props.level === 2 || props.level === 3 || props.level === 4
      ? props.level
      : 2;
  const align =
    props.align === 'left' || props.align === 'center' || props.align === 'right'
      ? props.align
      : 'left';
  const Tag = LEVEL_TAGS[level];
  return (
    <Tag className={styles.heading} style={{ textAlign: align }}>
      {text}
    </Tag>
  );
}
