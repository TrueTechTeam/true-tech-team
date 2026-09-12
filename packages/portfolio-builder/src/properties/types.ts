import type { ComponentType } from '../schema/types';

export type PropertyFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'image'
  | 'icon';

export interface PropertyFieldOption {
  value: string;
  label: string;
}

export interface PropertyField {
  key: string;
  label: string;
  type: PropertyFieldType;
  required?: boolean;
  options?: PropertyFieldOption[];
  optionValueType?: 'string' | 'number';
  min?: number;
  max?: number;
}

export type PropertySchema = PropertyField[];

export interface SelectedItem {
  componentType: ComponentType;
  props: Record<string, unknown>;
  span: number;
}
