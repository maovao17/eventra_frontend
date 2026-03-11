"use client"

import { motion } from "framer-motion"
import { useEvent } from "@/context/EventContext"
import Link from "next/link"
import { formatCurrency } from "../mockData"

type EventSummary = {
  id: string | number
  name: string
  date: string
  budget: string | number
  location?: string
  status?: string
}

export default function EventsPage() {
  const { events, setCurrentEventId } = useEvent()

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="theme-primary mb-2 text-sm font-semibold uppercase tracking-[0.2em]">
          Event Control
        </p>
        <h1 className="text-4xl font-bold mb-3">
          Your Events
        </h1>
        <p className="theme-muted text-lg">
          Track planning progress, review budget movement, and jump directly
          into vendor coordination for each event.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {events.map((event: EventSummary, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            whileHover={{ y: -6 }}
            className="theme-card p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">
                  {event.name}
                </h3>
                <p className="theme-muted mt-1">
                  {event.date}
                </p>
              </div>

              <span className="theme-pill px-3 py-1 text-xs font-semibold">
                {event.status ?? "Planning"}
              </span>
            </div>

            <p className="theme-muted mt-4 text-sm">
              {event.location ?? "Location to be finalized"}
            </p>

            <p className="mt-4 text-lg font-semibold">
              {typeof event.budget === "number"
                ? formatCurrency(event.budget)
                : `Budget ${event.budget}`}
            </p>

            <Link
              href={`/events/${event.id}`}
              onClick={() => setCurrentEventId(String(event.id))}
              className="theme-primary mt-5 inline-block font-medium"
            >
              Open Event →
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
