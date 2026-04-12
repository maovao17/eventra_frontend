"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { getVendorBookings } from "@/app/lib/vendorApi"
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState"
import { useToast } from "@/context/ToastContext"

type UpcomingBooking = {
  _id: string
  eventDetails?: {
    type?: string
    date?: string
    time?: string
    location?: string
    guests?: number
  }
  amount?: number
  status?: string
}

export default function VendorUpcomingEventsPage() {
  const { profile } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [events, setEvents] = useState<UpcomingBooking[]>([])

  useEffect(() => {
    const loadUpcoming = async () => {
      if (!profile?.uid) return
      setLoading(true)
      setError("")

      try {
        const response = await getVendorBookings()
        const list = Array.isArray(response) ? response : []
        setEvents(list.filter((item) => ["accepted", "confirmed"].includes(item.status)))
      } catch (fetchError) {
        const message =
          fetchError instanceof Error ? fetchError.message : "Could not load upcoming events"
        setError(message)
        showToast(message, "error")
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      void loadUpcoming()
    }, 0)
    return () => clearTimeout(timer)
  }, [profile?.uid])

  if (loading) {
    return <PageCardSkeleton count={3} className="md:grid-cols-1" />
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load upcoming events."
        description={error}
        onRetry={() => window.location.reload()}
        retryLabel="Retry"
      />
    )
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No upcoming events yet"
        description="Confirmed events will appear here once clients complete their bookings."
      />
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Upcoming Events</h1>

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event._id} className="theme-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{event.eventDetails?.type || "Event"}</p>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                event.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {event.status === "confirmed" ? "Confirmed" : "Awaiting Payment"}
              </span>
            </div>
            <p className="text-sm text-gray-500">{event.eventDetails?.date || "Date pending"} • {event.eventDetails?.time || "Time pending"}</p>
            <p className="text-sm text-gray-500">{event.eventDetails?.location || "Location pending"}</p>
            <p className="text-sm text-gray-500">
              Guests: {Number(event.eventDetails?.guests || 0)} •{" "}
              {event.amount ? `₹${Number(event.amount).toLocaleString("en-IN")}` : "Amount: agreed via chat"}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
