// Template to service mapping for pre-filling events
export const TEMPLATE_SERVICES = {
  Wedding: [
    'Catering',
    'Decoration',
    'Photography',
    'DJ'
  ],
  Birthday: [
    'Decoration',
    'Cake',
    'Entertainment'
  ]
} as const;

export type TemplateType = keyof typeof TEMPLATE_SERVICES;

export function getServicesForTemplate(templateType: string | null): string[] {
  if (!templateType || !(templateType in TEMPLATE_SERVICES)) {
    return [];
  }
  return [...TEMPLATE_SERVICES[templateType as TemplateType]];
}
