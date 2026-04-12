"use client"

import { useEffect, useMemo, useState } from "react"
import { MapPin, Search, Users } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/app/lib/api"
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState"
import { useToast } from "@/context/ToastContext"
import type { EventItem } from "@/app/types/eventra"

const toDisplayStatus = (status?: string) => {
  switch (status) {
    case "ongoing":
      return "Ongoing"
    case "completed":
      return "Completed"
    default:
      return "Upcoming"
  }
}

export default function EventsPage() {
  const { showToast } = useToast()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState("")

  const loadEvents = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await apiFetch("/admin/events")
      setEvents(Array.isArray(response) ? response : [])
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Could not load events."
      setError(message)
      showToast(message, "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadEvents()
  }, [])

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const status = toDisplayStatus(event.status)
        const matchesStatus = filter === "All" || status === filter
        const haystack = `${event.name || ""} ${event.eventType || ""}`.toLowerCase()
        return matchesStatus && haystack.includes(search.toLowerCase())
      }),
    [events, filter, search],
  )

  const removeEvent = async (eventId: string) => {
    setDeletingId(eventId)
    try {
      await apiFetch(`/admin/events/${eventId}`, { method: "DELETE" })
      setEvents((current) =>
        current.filter((event) => String(event._id || event.id) !== String(eventId)),
      )
      showToast("Event removed.", "success")
    } catch (fetchError) {
      showToast(fetchError instanceof Error ? fetchError.message : "Could not remove event.", "error")
    } finally {
      setDeletingId("")
    }
  }

  if (loading) {
    return <PageCardSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load events."
        description="Retry to manage the live event catalog."
        onRetry={() => void loadEvents()}
        retryLabel="Retry"
      />
    )
  }

  return (
    <div>
      <p className="theme-primary text-sm font-semibold mb-1">
        ADMIN OVERVIEW
      </p>

      <h1 className="text-3xl font-bold mb-1">
        View Events
      </h1>

      <p className="theme-muted mb-6">
        Monitor and manage all active, upcoming, and past events across the Eventra network.
      </p>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="theme-card flex w-[380px] items-center gap-3 rounded-xl px-4 py-3 shadow-sm">
          <Search size={18} className="theme-muted" />
          <input
            placeholder="Search events or categories..."
            className="w-full outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {["All", "Upcoming", "Ongoing", "Completed"].map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-2 text-sm ${
                filter === value ? "theme-pill" : "theme-muted"
              }`}
            >
              {value}
            </button>
          ))}

          <Link href="/admin/events/create" className="bg-[var(--primary)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90">
            + Create Event
          </Link>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No events found"
          description="Create an event or adjust your filters to see more results."
          actionLabel="Create Event"
          actionHref="/admin/events/create"
        />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {filteredEvents.map((event, index) => {
            const eventDate = event.eventDate
              ? new Date(event.eventDate)
              : event.date
                ? new Date(event.date)
                : null
            const month =
              eventDate?.toLocaleDateString("en-US", { month: "short" }).toUpperCase() || "TBD"
            const day =
              eventDate?.toLocaleDateString("en-US", { day: "2-digit" }) || "--"
            const status = toDisplayStatus(event.status)

            return (
              <div
                key={event._id || event.id || index}
                className="theme-card flex"
              >
                <div className="bg-[var(--primary-light)] w-20 rounded-l-xl flex flex-col items-center justify-center">
                  <h2 className="text-2xl font-bold theme-primary">{day}</h2>
                  <p className="text-xs theme-muted">{month}</p>
                </div>

                <div className="flex-1 p-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      status === "Upcoming"
                        ? "theme-pill"
                        : status === "Ongoing"
                          ? "theme-surface text-[var(--text-main)]"
                          : "bg-[var(--surface)] theme-muted"
                    }`}
                  >
                    {status}
                  </span>

                  <div className="mt-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{event.name || "Untitled Event"}</h3>
                  </div>

                  <p className="theme-muted mt-2 text-sm">
                    {event.eventType || "Custom Event"} planning workflow running in Eventra.
                  </p>

                  <div className="theme-muted mt-3 flex items-center gap-2 text-sm">
                    <MapPin size={16} />
                    <p>{event.location?.label || event.location?.address || "Location pending"}</p>
                    <Users size={16} />
                    <p>{Number(event.guestCount || 0)} guests</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm theme-muted truncate">
                      Organised by&nbsp;
                      <span className="font-medium text-[var(--text-main)]">
                        {event.customerId || "Admin"}
                      </span>
                    </p>

                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => void removeEvent(String(event._id || event.id))}
                        disabled={deletingId === String(event._id || event.id)}
                        className="border rounded-lg px-3 py-1.5 text-xs font-medium theme-muted hover:text-red-500 hover:border-red-300 transition-colors disabled:opacity-40"
                      >
                        {deletingId === String(event._id || event.id) ? "Removing..." : "Delete"}
                      </button>
                      <Link
                        href={`/admin/events/${String(event._id || event.id)}`}
                        className="theme-button px-3 py-1.5 text-xs font-medium rounded-lg"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
