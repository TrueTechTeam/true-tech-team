import styles from './Text.module.scss';
import type { PropertySchema } from '../../properties/types';

export interface TextItemProps {
  text: string;
  size?: 'sm' | 'base' | 'lg';
  align?: 'left' | 'center' | 'right';
}

export function validateTextProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.text !== 'string' || props.text.length === 0) {
    errors.push('text is required and must be a string');
  }
  return errors;
}

export function TextItem(props: Record<string, unknown>) {
  const text = typeof props.text === 'string' ? props.text : '';
  const size =
    props.size === 'sm' || props.size === 'base' || props.size === 'lg' ? props.size : 'base';
  const align =
    props.align === 'left' || props.align === 'center' || props.align === 'right'
      ? props.align
      : 'left';
  return (
    <p className={styles.text} data-size={size} style={{ textAlign: align }}>
      {text}
    </p>
  );
}

export const textPropertySchema: PropertySchema = [
  { key: 'text', label: 'Text', type: 'textarea', required: true },
  {
    key: 'size',
    label: 'Size',
    type: 'select',
    options: [
      { value: 'sm', label: 'Small' },
      { value: 'base', label: 'Base' },
      { value: 'lg', label: 'Large' },
    ],
  },
  {
    key: 'align',
    label: 'Alignment',
    type: 'select',
    options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ],
  },
];
