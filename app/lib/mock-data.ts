export const templates = [
  { title: "Wedding", description: "Elegant ceremonies with curated premium vendors.", budget: "₹3L - ₹25L", image: "/HeroCard.avif" },
  { title: "Birthday", description: "Celebrate milestones with vibrant themes.", budget: "₹50k - ₹5L", image: "/21st.jpg" },
  { title: "Anniversary", description: "Intimate or grand celebrations for special moments.", budget: "₹80k - ₹8L", image: "/roce.jpg" },
  { title: "Corporate", description: "Professional conferences and annual gatherings.", budget: "₹2L - ₹30L", image: "/HeroCard.avif" },
  { title: "Baby Shower", description: "Joyful and cozy experiences for families.", budget: "₹40k - ₹4L", image: "/baby.jpeg" },
  { title: "Gala Dinner", description: "Luxury evenings with entertainment and hospitality.", budget: "₹5L - ₹50L", image: "/HeroCard.avif" },
];

export const templateServices: Record<string, string[]> = {
  Wedding: ["Venue", "Photographer", "Catering", "Decoration", "Makeup Artist", "DJ"],
  Birthday: ["Venue", "Cake", "Decoration", "Entertainment"],
  Anniversary: ["Venue", "Catering", "Photography", "Live Band"],
  Corporate: ["Venue", "Lighting", "Security", "Transportation"],
  "Baby Shower": ["Decoration", "Cake", "Catering", "Photographer"],
  "Gala Dinner": ["Venue", "Live Band", "Catering", "Security"],
};

export const discoverableServices = ["Lighting", "Cake", "Security", "Transportation", "Entertainment", "Parking", "Live Band"];

export const vendors = [
  { id: "velvet-vine", name: "Velvet & Vine Productions", rating: 4.8, priceRange: "₹75k - ₹2L", location: "Mumbai", description: "Luxury floral installations and decor concepts.", image: "/HeroCard.avif", service: "Decoration" },
  { id: "lumiere-photo", name: "Lumiere Studios", rating: 4.9, priceRange: "₹55k - ₹1.5L", location: "Pune", description: "Cinematic storytelling for weddings and events.", image: "/21st.jpg", service: "Photographer" },
  { id: "spice-route", name: "Spice Route Catering", rating: 4.6, priceRange: "₹900 - ₹1800 / plate", location: "Mumbai", description: "Premium Indian and global catering menus.", image: "/roce.jpg", service: "Catering" },
];
