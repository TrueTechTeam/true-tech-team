import { Card, type CardProps } from '@true-tech-team/react-components';
import type { PropertySchema } from '../../properties/types';
import { HeadingItem } from '../primitives/Heading';
import { ImageItem } from '../primitives/Image';
import { TextItem } from '../primitives/Text';

export interface CardItemProps {
  header?: string;
  body: string;
  footer?: string;
  imageSrc?: string;
  imageAlt?: string;
  variant?: CardProps['variant'];
}

export function validateCardProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.body !== 'string' || props.body.length === 0) {
    errors.push('body is required and must be a string');
  }
  return errors;
}

export function CardItem(props: Record<string, unknown>) {
  const header = typeof props.header === 'string' ? props.header : undefined;
  const body = typeof props.body === 'string' ? props.body : '';
  const footer = typeof props.footer === 'string' ? props.footer : undefined;
  const imageSrc = typeof props.imageSrc === 'string' ? props.imageSrc : undefined;
  const imageAlt = typeof props.imageAlt === 'string' ? props.imageAlt : '';
  const variant =
    typeof props.variant === 'string' ? (props.variant as CardProps['variant']) : undefined;

  return (
    <Card
      variant={variant}
      header={header ? <HeadingItem text={header} level={4} /> : undefined}
      footer={footer ? <TextItem text={footer} size="sm" /> : undefined}
    >
      {imageSrc ? <ImageItem src={imageSrc} alt={imageAlt} /> : null}
      <TextItem text={body} />
    </Card>
  );
}

export const cardPropertySchema: PropertySchema = [
  { key: 'header', label: 'Header', type: 'text' },
  { key: 'body', label: 'Body', type: 'textarea', required: true },
  { key: 'footer', label: 'Footer', type: 'text' },
  { key: 'imageSrc', label: 'Image', type: 'image' },
  { key: 'imageAlt', label: 'Image alt text', type: 'text' },
  {
    key: 'variant',
    label: 'Variant',
    type: 'select',
    options: [
      { value: 'outlined', label: 'Outlined' },
      { value: 'elevated', label: 'Elevated' },
      { value: 'filled', label: 'Filled' },
    ],
  },
];
