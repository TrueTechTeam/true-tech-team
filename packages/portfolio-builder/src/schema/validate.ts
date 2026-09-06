import { isComponentType } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function validateGridItem(value: unknown, path: string): string[] {
  if (!isRecord(value)) {
    return [`${path} must be an object`];
  }
  const errors: string[] = [];
  if (typeof value.id !== 'string' || value.id.length === 0) {
    errors.push(`${path}.id is required and must be a non-empty string`);
  }
  if (typeof value.component !== 'string' || !isComponentType(value.component)) {
    errors.push(`${path}.component is an unknown component: ${String(value.component)}`);
  }
  if (typeof value.span !== 'number' || value.span < 1 || value.span > 12) {
    errors.push(`${path}.span must be a number between 1 and 12`);
  }
  if (!isRecord(value.props)) {
    errors.push(`${path}.props must be an object`);
  }
  return errors;
}

function validateSectionRow(value: unknown, path: string): string[] {
  if (!isRecord(value)) {
    return [`${path} must be an object`];
  }
  const errors: string[] = [];
  if (typeof value.id !== 'string' || value.id.length === 0) {
    errors.push(`${path}.id is required and must be a non-empty string`);
  }
  if (!Array.isArray(value.items)) {
    errors.push(`${path}.items must be an array`);
    return errors;
  }
  value.items.forEach((item, index) => {
    errors.push(...validateGridItem(item, `${path}.items[${index}]`));
  });
  const totalSpan = value.items.reduce((sum: number, item) => {
    return isRecord(item) && typeof item.span === 'number' ? sum + item.span : sum;
  }, 0);
  if (totalSpan > 12) {
    errors.push(`${path}: item spans sum to ${totalSpan}, which exceeds 12`);
  }
  return errors;
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
  if (!Array.isArray(value.rows)) {
    errors.push(`${path}.rows must be an array`);
    return errors;
  }
  value.rows.forEach((row, index) => {
    errors.push(...validateSectionRow(row, `${path}.rows[${index}]`));
  });
  return errors;
}

export function validatePortfolioPage(value: unknown): ValidationResult {
  if (!isRecord(value)) {
    return { valid: false, errors: ['page must be an object'] };
  }
  const errors: string[] = [];
  if (value.schemaVersion !== 1) {
    errors.push('schemaVersion must be 1');
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
  if (typeof value.showNav !== 'boolean') {
    errors.push('showNav must be a boolean');
  }
  if (!Array.isArray(value.sections)) {
    errors.push('sections must be an array');
  } else {
    value.sections.forEach((section, index) => {
      errors.push(...validatePageSection(section, `sections[${index}]`));
    });
  }
  return { valid: errors.length === 0, errors };
}
