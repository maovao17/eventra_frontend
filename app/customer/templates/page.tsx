"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

type TemplateCardItem = {
  slug: string
  name: string
  img: string
  description: string
}

const templates: TemplateCardItem[] = [
  {
    slug: "wedding",
    name: "Wedding",
    img: "/eventra_photos/wedding.jpg",
    description: "Plan a multi-vendor celebration with venue, decor, beauty, and guest coordination.",
  },
  {
    slug: "birthday",
    name: "Birthday",
    img: "/eventra_photos/bday.jpg",
    description: "Build a lighter event setup for intimate celebrations, entertainers, and food experiences.",
  },
  {
    slug: "corporate",
    name: "Corporate",
    img: "/eventra_photos/corporate1.jpg",
    description: "Organize professional launches, networking events, and executive gatherings with clear structure.",
  },
]

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold mb-3">
          Your Event, Your Template
        </h1>
        <p className="theme-muted text-lg">
          Start with a structured template, then customize vendors, budget,
          timeline, and conversations as your event evolves.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {templates.map((template, index) => (
          <motion.div
            key={template.slug}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            whileHover={{ scale: 1.04 }}
            className="theme-card overflow-hidden"
          >
            <div className="relative h-48">
              <Image
                src={template.img}
                alt={template.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-6">
              <h3 className="text-xl font-semibold">{template.name}</h3>

              <p className="theme-muted mt-2">
                {template.description}
              </p>

              <p className="theme-muted mt-3 text-sm">
                Start with this flow and customize services as vendors respond.
              </p>

              <Link
                href={`/customer/events/create?type=${template.name}`}
                className="theme-primary inline-block mt-4 font-medium"
              >
                Select Template →
              </Link>
            </div>
          </motion.div>
        ))}

        <Link href="/customer/events/create">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.35 }}
            whileHover={{ scale: 1.05 }}
            className="theme-card flex h-full min-h-[22rem] items-center justify-center border-2 border-dashed p-10 text-center"
          >
            <div>
              <p className="theme-primary text-sm font-semibold uppercase tracking-[0.2em]">
                Custom Flow
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Create Custom Event
              </h2>
              <p className="theme-muted mt-3">
                Start with a blank plan and plug in templates, vendors,
                integrations, and payments later.
              </p>
            </div>
          </motion.div>
        </Link>
      </div>
    </div>
  )
}
