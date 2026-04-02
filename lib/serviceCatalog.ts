export type ServiceCatalogItem = {
  name: string
  category: string
  keywords: string[]
}

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  { name: "Venue Booking", category: "Venue", keywords: ["venue", "hall", "resort", "lawn"] },
  { name: "Catering", category: "Food", keywords: ["catering", "food", "buffet", "dinner"] },
  { name: "Decoration", category: "Decor", keywords: ["decor", "decoration", "floral", "theme"] },
  { name: "Photography", category: "Media", keywords: ["photo", "photography", "portraits"] },
  { name: "Videography", category: "Media", keywords: ["video", "videography", "cinematic"] },
  { name: "Live Streaming", category: "Media", keywords: ["stream", "live", "broadcast"] },
  { name: "DJ", category: "Entertainment", keywords: ["dj", "music", "dance"] },
  { name: "Live Band", category: "Entertainment", keywords: ["band", "live music", "singer"] },
  { name: "Emcee", category: "Entertainment", keywords: ["host", "emcee", "anchor"] },
  { name: "Entertainment", category: "Entertainment", keywords: ["entertainment", "performer", "show"] },
  { name: "Cake", category: "Dessert", keywords: ["cake", "dessert", "bakery"] },
  { name: "Makeup Artist", category: "Beauty", keywords: ["makeup", "beauty", "artist"] },
  { name: "Mehendi Artist", category: "Beauty", keywords: ["mehendi", "henna"] },
  { name: "Bridal Styling", category: "Beauty", keywords: ["bridal", "styling", "dress"] },
  { name: "Invitations", category: "Stationery", keywords: ["invite", "invitation", "cards"] },
  { name: "Guest Management", category: "Operations", keywords: ["guest", "rsvp", "seating"] },
  { name: "Travel & Transport", category: "Logistics", keywords: ["travel", "transport", "pickup"] },
  { name: "Accommodation", category: "Logistics", keywords: ["stay", "hotel", "rooms"] },
  { name: "Security", category: "Operations", keywords: ["security", "bouncer", "safety"] },
  { name: "Lighting", category: "Production", keywords: ["lights", "lighting", "ambience"] },
  { name: "Sound Setup", category: "Production", keywords: ["sound", "audio", "speakers"] },
  { name: "Stage Setup", category: "Production", keywords: ["stage", "platform", "backdrop"] },
  { name: "Furniture Rental", category: "Rentals", keywords: ["chairs", "tables", "furniture"] },
  { name: "Flower Arrangements", category: "Decor", keywords: ["flowers", "bouquet", "floral"] },
  { name: "Return Gifts", category: "Gifting", keywords: ["gift", "favors", "return gifts"] },
  { name: "Wedding Planner", category: "Planning", keywords: ["planner", "coordination", "planning"] },
  { name: "Birthday Planner", category: "Planning", keywords: ["birthday", "planner", "theme"] },
  { name: "Bartending", category: "Food", keywords: ["bar", "bartender", "cocktails"] },
  { name: "Food Stalls", category: "Food", keywords: ["stalls", "snacks", "street food"] },
  { name: "Kids Activities", category: "Entertainment", keywords: ["kids", "games", "activities"] },
  { name: "Photo Booth", category: "Media", keywords: ["photobooth", "booth", "props"] },
  { name: "Valet Service", category: "Logistics", keywords: ["valet", "parking"] },
]

export const searchServiceCatalog = (query: string) => {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) return SERVICE_CATALOG

  return SERVICE_CATALOG.filter((item) => {
    const haystack = [item.name, item.category, ...item.keywords].join(" ").toLowerCase()
    return haystack.includes(normalizedQuery)
  })
}

export const getSuggestedServices = (selectedServices: string[] = [], limit = 8) => {
  const selected = new Set(selectedServices.map((item) => item.toLowerCase()))

  return SERVICE_CATALOG.filter((item) => !selected.has(item.name.toLowerCase())).slice(0, limit)
}
