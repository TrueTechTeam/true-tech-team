export type PropertyFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'image'
  | 'icon'
  | 'list';

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
  /** Required when `type === 'list'`: the schema each entry in the list follows. */
  itemSchema?: PropertySchema;
  /** Singular noun for the add button, e.g. "Photo" renders "Add Photo". */
  itemLabel?: string;
  /** Optional cap on list length. */
  maxItems?: number;
}

export type PropertySchema = PropertyField[];
