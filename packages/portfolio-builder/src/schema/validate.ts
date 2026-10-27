import { CURRENT_SCHEMA_VERSION, isSectionType, SECTION_TYPES } from './types';
// Metadata only, never `sections/registry`: that module imports the section components, and
// pulling the component layer in here would reach every importer of `validatePortfolioPage`,
// `pages/crud.ts` among them.
import { SECTION_META } from '../sections/meta';
import type { PropertyField, PropertySchema } from '../properties/types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateField(value: unknown, field: PropertyField, path: string): string[] {
  const errors: string[] = [];
  const fieldPath = `${path}.${field.key}`;

  const isEmptyList = field.type === 'list' && Array.isArray(value) && value.length === 0;
  if (value === undefined || value === null || value === '' || isEmptyList) {
    if (field.required) {
      errors.push(`${fieldPath} is required and must be a non-empty ${field.type}`);
    }
    return errors;
  }

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'image':
    case 'icon':
      if (typeof value !== 'string') {
        errors.push(`${fieldPath} must be a string`);
      }
      break;
    case 'number':
      if (typeof value !== 'number' || Number.isNaN(value)) {
        errors.push(`${fieldPath} must be a number`);
      } else {
        if (field.min !== undefined && value < field.min) {
          errors.push(`${fieldPath} must be at least ${field.min}`);
        }
        if (field.max !== undefined && value > field.max) {
          errors.push(`${fieldPath} must be at most ${field.max}`);
        }
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${fieldPath} must be a boolean`);
      }
      break;
    case 'select': {
      // Option values are declared as strings; `optionValueType` says what the STORED value is.
      // Compare strictly against that type so `"3"` cannot pass where `3` was meant.
      const allowed = (field.options ?? []).map((option) => option.value);
      const storedType = field.optionValueType === 'number' ? 'number' : 'string';
      if (typeof value !== storedType || !allowed.includes(String(value))) {
        errors.push(`${fieldPath} must be one of ${allowed.join(', ')}`);
      }
      break;
    }
    case 'list': {
      if (!Array.isArray(value)) {
        errors.push(`${fieldPath} must be an array`);
        break;
      }
      if (field.maxItems !== undefined && value.length > field.maxItems) {
        errors.push(`${fieldPath} must have at most ${field.maxItems} entries`);
      }
      const itemSchema = field.itemSchema ?? [];
      value.forEach((entry, index) => {
        const entryPath = `${fieldPath}[${index}]`;
        if (!isRecord(entry)) {
          errors.push(`${entryPath} must be an object`);
          return;
        }
        errors.push(...validateSectionProps(entry, itemSchema, entryPath));
      });
      break;
    }
  }

  return errors;
}

/** Validates a props bag against a property schema. Exported for the registry parity test. */
export function validateSectionProps(
  props: Record<string, unknown>,
  schema: PropertySchema,
  path: string
): string[] {
  return schema.flatMap((field) => validateField(props[field.key], field, path));
}

const VALID_BACKGROUNDS = ['primary', 'secondary', 'tertiary', 'transparent'];

function validatePageSection(value: unknown, path: string): string[] {
  if (!isRecord(value)) {
    return [`${path} must be an object`];
  }
  const errors: string[] = [];
  if (typeof value.id !== 'string' || value.id.length === 0) {
    errors.push(`${path}.id is required and must be a non-empty string`);
  }
  if (typeof value.name !== 'string' || value.name.length === 0) {
    errors.push(`${path}.name is required and must be a non-empty string`);
  }
  if (typeof value.showInNav !== 'boolean') {
    errors.push(`${path}.showInNav must be a boolean`);
  }
  if (value.background !== undefined && !VALID_BACKGROUNDS.includes(value.background as string)) {
    errors.push(`${path}.background must be one of ${VALID_BACKGROUNDS.join(', ')}`);
  }
  if (typeof value.type !== 'string' || !isSectionType(value.type)) {
    errors.push(`${path}.type is an unknown section type: ${String(value.type)}`);
    return errors;
  }
  if (!isRecord(value.props)) {
    errors.push(`${path}.props must be an object`);
    return errors;
  }
  errors.push(
    ...validateSectionProps(value.props, SECTION_META[value.type].propertySchema, `${path}.props`)
  );
  return errors;
}

export function validatePortfolioPage(value: unknown): ValidationResult {
  if (!isRecord(value)) {
    return { valid: false, errors: ['page must be an object'] };
  }
  const errors: string[] = [];
  if (value.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${CURRENT_SCHEMA_VERSION}`);
  }
  if (typeof value.slug !== 'string' || value.slug.length === 0) {
    errors.push('slug is required and must be a non-empty string');
  }
  if (typeof value.title !== 'string' || value.title.length === 0) {
    errors.push('title is required and must be a non-empty string');
  }
  if (typeof value.templateId !== 'string' || value.templateId.length === 0) {
    errors.push('templateId is required and must be a non-empty string');
  }
  if (!Array.isArray(value.sections)) {
    errors.push('sections must be an array');
    return { valid: errors.length === 0, errors };
  }

  value.sections.forEach((section, index) => {
    errors.push(...validatePageSection(section, `sections[${index}]`));
  });

  SECTION_TYPES.forEach((type) => {
    if (!SECTION_META[type].singleton) {
      return;
    }
    const count = (value.sections as unknown[]).filter(
      (section) => isRecord(section) && section.type === type
    ).length;
    if (count > 1) {
      errors.push(`sections: only one ${type} section is allowed, found ${count}`);
    }
  });

  return { valid: errors.length === 0, errors };
}
