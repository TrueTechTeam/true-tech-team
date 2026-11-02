import type { TemplateDefinition } from './types';
import { softwareTemplate } from './software';
import { graphicDesignTemplate } from './graphicDesign';
import { projectManagerTemplate } from './projectManager';
import { cartographyTemplate } from './cartography';
import { marketingTemplate } from './marketing';
import { blankTemplate } from './blank';

/**
 * Every template, in the order the picker shows them. The first entry is the default selection, so
 * order is user-visible.
 */
export const TEMPLATES: Record<string, TemplateDefinition> = {
  [softwareTemplate.id]: softwareTemplate,
  [graphicDesignTemplate.id]: graphicDesignTemplate,
  [projectManagerTemplate.id]: projectManagerTemplate,
  [cartographyTemplate.id]: cartographyTemplate,
  [marketingTemplate.id]: marketingTemplate,
  [blankTemplate.id]: blankTemplate,
};

export const TEMPLATE_IDS: readonly string[] = [
  softwareTemplate.id,
  graphicDesignTemplate.id,
  projectManagerTemplate.id,
  cartographyTemplate.id,
  marketingTemplate.id,
  blankTemplate.id,
];

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES[id];
}
