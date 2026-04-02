"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/app/lib/api"
import { EmptyState, ErrorState, PageCardSkeleton, PageIntroSkeleton } from "@/components/ui/PageState"
import { useToast } from "@/context/ToastContext"

type Service = {
  _id: string
  name: string
  category?: string
  price?: number
  description?: string
}

type TemplateCardItem = {
  slug: string
  name: string
  img: string
  description: string
  highlight: string
  serviceCount: number
}

const templateVisuals: Record<
  string,
  { img: string; description: string; highlight: string }
> = {
  wedding: {
    img: "/eventra_photos/wedding.jpg",
    description: "Plan a multi-vendor celebration with venue, decor, beauty, and guest coordination.",
    highlight: "Best for large event planning",
  },
  birthday: {
    img: "/eventra_photos/bday.jpg",
    description: "Build a lighter event setup for intimate celebrations, entertainers, and food experiences.",
    highlight: "Great for fast setup",
  },
  corporate: {
    img: "/eventra_photos/corporate1.jpg",
    description: "Organize professional launches, networking events, and executive gatherings with clear structure.",
    highlight: "Optimized for approvals",
  },
}

export default function TemplatesPage() {
  const { showToast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadServices = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await apiFetch("/services")
      setServices(Array.isArray(response) ? response : [])
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Could not load services."
      setError(message)
      setServices([])
      showToast(message, "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadServices()
  }, [])

  const templates = useMemo<TemplateCardItem[]>(() => {
    const grouped = new Map<string, number>()

    services.forEach((service) => {
      const category = String(service.category ?? service.name ?? "Custom").trim()
      if (!category) return
      const normalized = category.toLowerCase()
      const current = grouped.get(normalized) ?? 0
      grouped.set(normalized, current + 1)
    })

    const curated = ["wedding", "birthday", "corporate"]

    return curated.map((slug) => {
      const visual = templateVisuals[slug]
      const label = slug.charAt(0).toUpperCase() + slug.slice(1)
      return {
        slug,
        name: label,
        img: visual.img,
        description: visual.description,
        highlight: `${grouped.get(slug) ?? 0} live service options`,
        serviceCount: grouped.get(slug) ?? 0,
      }
    })
  }, [services])

  if (loading) {
    return (
      <div className="space-y-8">
        <PageIntroSkeleton />
        <PageCardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load templates."
        description="Retry to pull the latest service-backed planning options."
        onRetry={() => void loadServices()}
        retryLabel="Retry"
      />
    )
  }

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

      {templates.length === 0 ? (
        <EmptyState
          title="No templates available yet"
          description="Create a custom event for now, or retry after services are loaded."
          actionLabel="Create Custom Event"
          actionHref="/customer/events/create"
          secondaryAction={
            <button
              type="button"
              onClick={() => void loadServices()}
              className="rounded-full border px-5 py-2 text-sm font-medium"
            >
              Retry
            </button>
          }
        />
      ) : (
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
              <div className="theme-pill inline-flex px-3 py-1 text-xs font-semibold">
                {template.highlight}
              </div>

              <h3 className="mt-4 text-xl font-semibold">{template.name}</h3>

              <p className="theme-muted mt-2">
                {template.description}
              </p>

              <p className="theme-muted mt-3 text-sm">
                {template.serviceCount > 0
                  ? `${template.serviceCount} matching service categories available now.`
                  : "Start with this flow and customize services as vendors respond."}
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
      )}
    </div>
  )
}

