import { SERVICE_CATALOG } from "@/lib/serviceCatalog"

const pick = (...serviceNames: string[]) =>
  serviceNames.filter((service) =>
    SERVICE_CATALOG.some((item) => item.name === service)
  )

export const TEMPLATE_SERVICES = {
  Wedding: pick(
    "Venue Booking",
    "Catering",
    "Decoration",
    "Photography",
    "Videography",
    "Makeup Artist",
    "Mehendi Artist",
    "DJ",
    "Guest Management"
  ),
  Birthday: pick(
    "Decoration",
    "Cake",
    "Entertainment",
    "Photography",
    "Food Stalls",
    "Kids Activities"
  ),
} as const

export type TemplateType = keyof typeof TEMPLATE_SERVICES

export function getServicesForTemplate(templateType: string | null): string[] {
  if (!templateType || !(templateType in TEMPLATE_SERVICES)) {
    return []
  }
  return [...TEMPLATE_SERVICES[templateType as TemplateType]]
}
