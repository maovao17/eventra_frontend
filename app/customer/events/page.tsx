"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import EventProgress from "@/components/event/EventProgress"
import { EmptyState, ErrorState, PageCardSkeleton, PageIntroSkeleton } from "@/components/ui/PageState"
import { useEvent } from "@/context/EventContext"

type EventSummary = {
  id: string | number
  _id?: string
  name: string
  date: string
  budget: string | number
  location?: string
  status?: string
}

export default function EventsPage() {
  const { events, isLoading, error, refreshData } = useEvent()

  if (isLoading) {
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
        title="We couldn't load your events."
        description="Retry to refresh your plans and planning progress."
        onRetry={() => void refreshData()}
        retryLabel="Retry"
      />
    )
  }

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

      {events.length === 0 ? (
        <EmptyState
          title="Add your first event"
          description="Start with a template or create a custom event plan to track services, vendors, and payments."
          actionLabel="Create Event"
          actionHref="/customer/events/create"
        />
      ) : (
      <div className="grid gap-8 md:grid-cols-3">
        {events.map((event, index) => (
          <motion.div
            key={event.id || index}
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

            <div className="mt-4">
              <EventProgress
                progress={
                  event.status === "completed"
                    ? 100
                    : event.status === "confirmed"
                      ? 85
                      : event.status === "planning"
                        ? 45
                        : 20
                }
              />
            </div>

              <p className="mt-4 text-lg font-semibold">
              {typeof event.budget === "number"
                ? new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(event.budget)
                : `Budget ${event.budget}`}
            </p>

            <Link
              href={`/customer/events/${event.id}`}
              className="theme-primary mt-5 inline-block font-medium"
            >
              Open Event →
            </Link>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  )
}
