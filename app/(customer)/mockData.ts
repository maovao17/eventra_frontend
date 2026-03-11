export type Template = {
  name: string
  slug: string
  img: string
  description: string
  highlight: string
}

export type Vendor = {
  id: string
  name: string
  category: string
  location: string
  price: number
  rating: number
  responseTime: string
  image: string
  description: string
  services: string[]
}

export type EventRecord = {
  id: string
  name: string
  type: string
  date: string
  location: string
  status: string
  guests: number
  budget: number
  spent: number
  coverImage: string
  notes: string
  checklist: string[]
  vendorIds: string[]
  timeline: Array<{
    title: string
    detail: string
  }>
}

export const serviceCatalog = [
  "Photographer",
  "Venue",
  "Catering",
  "Decoration",
  "DJ",
  "Lighting",
  "Makeup"
]

export const customerTemplates: Template[] = [
  {
    name: "Wedding",
    slug: "wedding",
    img: "/eventra_photos/wedding.jpg",
    description: "Plan your dream wedding with curated venues, decor, and guest management.",
    highlight: "Best for multi-vendor planning"
  },
  {
    name: "Birthday",
    slug: "birthday",
    img: "/eventra_photos/bday.jpg",
    description: "Create playful birthday setups with catering, cakes, and entertainers.",
    highlight: "Fast setup for intimate celebrations"
  },
  {
    name: "Corporate",
    slug: "corporate",
    img: "/eventra_photos/corporate1.jpg",
    description: "Professional event planning for launches, summits, and private executive events.",
    highlight: "Optimized for timelines and approvals"
  }
]

export const customerVendors: Vendor[] = [
  {
    id: "1",
    name: "StudioX Photography",
    category: "Photography",
    location: "Panaji, Goa",
    price: 20000,
    rating: 4.9,
    responseTime: "Replies in 1 hour",
    image: "/eventra_photos/photographer.jpg",
    description: "Editorial-style photography with same-day previews and cinematic reels.",
    services: ["Pre-wedding shoot", "Wedding day coverage", "Cinematic reels"]
  },
  {
    id: "2",
    name: "Royal Caterers",
    category: "Catering",
    location: "Candolim, Goa",
    price: 35000,
    rating: 4.8,
    responseTime: "Replies in 2 hours",
    image: "/eventra_photos/culinary.jpg",
    description: "Large-format catering menus for weddings, conferences, and private dinners.",
    services: ["Buffet setup", "Live counters", "Dessert stations"]
  },
  {
    id: "3",
    name: "Velvet & Vine Decor",
    category: "Decor",
    location: "Margao, Goa",
    price: 28000,
    rating: 4.7,
    responseTime: "Replies in 30 minutes",
    image: "/eventra_photos/floral4.jpg",
    description: "Stage design, floral installations, and venue styling with custom concepts.",
    services: ["Stage styling", "Floral concept", "Entrance setup"]
  }
]

export const customerEvents: EventRecord[] = [
  {
    id: "1",
    name: "Wedding Celebration",
    type: "Wedding",
    date: "12 Dec 2026",
    location: "Goa",
    status: "Planning",
    guests: 220,
    budget: 850000,
    spent: 410000,
    coverImage: "/eventra_photos/wedding4.jpg",
    notes: "Vendor confirmations open this week. Focus on decor sign-off and guest transport.",
    checklist: [
      "Finalize decor moodboard",
      "Lock photography contract",
      "Review catering tasting menu",
      "Confirm guest stay logistics"
    ],
    vendorIds: ["1", "2"],
    timeline: [
      {
        title: "This Week",
        detail: "Shortlist decor and approve final quote."
      },
      {
        title: "Next 10 Days",
        detail: "Freeze guest count and release catering advance."
      },
      {
        title: "Event Month",
        detail: "Run final production walkthrough with all vendors."
      }
    ]
  }
]

export const checkoutItems = [
  {
    id: "1",
    name: "StudioX Photography",
    category: "Photography",
    amount: 20000
  },
  {
    id: "2",
    name: "Royal Caterers",
    category: "Catering",
    amount: 35000
  }
]

export const messageThreads = [
  {
    id: "1",
    vendorName: "StudioX Photography",
    preview: "We can hold your December slot for 48 hours.",
    updatedAt: "2m ago"
  },
  {
    id: "2",
    vendorName: "Royal Caterers",
    preview: "Sharing the tasting menu and guest slab pricing.",
    updatedAt: "18m ago"
  }
]

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value)
