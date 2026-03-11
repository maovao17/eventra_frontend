"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { customerTemplates } from "../mockData"

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
        {customerTemplates.map((template, index) => (
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
              <div className="theme-pill inline-flex px-3 py-1 text-xs font-semibold">
                {template.highlight}
              </div>

              <h3 className="mt-4 text-xl font-semibold">{template.name}</h3>

              <p className="theme-muted mt-2">
                {template.description}
              </p>

              <Link
                href={`/events/create?type=${template.name}`}
                className="theme-primary inline-block mt-4 font-medium"
              >
                Select Template →
              </Link>
            </div>
          </motion.div>
        ))}

        <Link href="/events/create">
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
