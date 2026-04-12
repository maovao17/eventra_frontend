"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiFetch } from "@/app/lib/api"
import { ErrorState, PageCardSkeleton } from "@/components/ui/PageState"
import type { EventItem } from "@/app/types/eventra"

export default function AdminEventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const router = useRouter()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`/admin/events/${eventId}`)
        setEvent(data as EventItem)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load event.")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [eventId])

  if (loading) return <PageCardSkeleton count={2} className="md:grid-cols-1" />

  if (error) {
    return (
      <ErrorState
        title="Could not load event"
        description={error}
        onRetry={() => router.back()}
        retryLabel="Go Back"
      />
    )
  }

  if (!event) return null

  const displayDate = event.eventDate || event.date
    ? new Date(event.eventDate || event.date!).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—"

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="theme-muted text-sm mb-4 hover:underline"
        >
          ← Back to Events
        </button>
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <p className="theme-muted mt-1 text-sm capitalize">{event.eventType}</p>
      </div>

      <div className="theme-card p-6 space-y-4">
        <h2 className="font-semibold">Event Details</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="theme-muted">Status</p>
            <p className="font-medium capitalize mt-1">{event.status || "—"}</p>
          </div>
          <div>
            <p className="theme-muted">Event Date</p>
            <p className="font-medium mt-1">{displayDate}</p>
          </div>
          <div>
            <p className="theme-muted">Location</p>
            <p className="font-medium mt-1">
              {event.location?.label || event.location?.address || "—"}
            </p>
          </div>
          <div>
            <p className="theme-muted">Guest Count</p>
            <p className="font-medium mt-1">{event.guestCount ?? "—"}</p>
          </div>
          <div>
            <p className="theme-muted">Budget</p>
            <p className="font-medium mt-1">
              {event.budget != null
                ? `₹${Number(event.budget).toLocaleString("en-IN")}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="theme-muted">Created</p>
            <p className="font-medium mt-1">
              {event.createdAt
                ? new Date(event.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
