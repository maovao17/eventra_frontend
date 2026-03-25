"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { getVendorBookings } from "@/app/lib/vendorApi"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [events, setEvents] = useState<UpcomingBooking[]>([])

  useEffect(() => {
    const loadUpcoming = async () => {
      if (!profile?.uid) return
      setLoading(true)
      setError("")

      const response = await getVendorBookings("upcoming")
      if (response?.error) {
        setError(response.message || "Could not load upcoming events")
        setLoading(false)
        return
      }

      const list = Array.isArray(response) ? response : []
      setEvents(list.filter((item) => item.status === "accepted" || item.status === "confirmed"))
      setLoading(false)
    }

    const timer = setTimeout(() => {
      void loadUpcoming()
    }, 0)
    return () => clearTimeout(timer)
  }, [profile?.uid])

  if (loading) {
    return <p>Loading upcoming events...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (events.length === 0) {
    return <p>No upcoming events.</p>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Upcoming Events</h1>

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event._id} className="theme-card p-4">
            <p className="font-medium">{event.eventDetails?.type || "Event"}</p>
            <p className="text-sm text-gray-500">{event.eventDetails?.date || "Date pending"} • {event.eventDetails?.time || "Time pending"}</p>
            <p className="text-sm text-gray-500">{event.eventDetails?.location || "Location pending"}</p>
            <p className="text-sm text-gray-500">Guests: {Number(event.eventDetails?.guests || 0)} • Amount: ₹{Number(event.amount || 0).toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
