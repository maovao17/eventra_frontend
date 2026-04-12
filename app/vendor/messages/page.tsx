"use client"

import { Suspense, useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState"
import { getChatIdForBooking } from "@/lib/chat"
import { getVendorBookings } from "@/app/lib/vendorApi"

type RawBooking = {
  _id?: string
  id?: string
  status?: string
  amount?: number
  eventId?: string
  eventDetails?: { type?: string }
}

function MessagesPageContent() {
  const router = useRouter()
  const { profile } = useAuth()

  const [bookings, setBookings] = useState<RawBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile?.uid) return

    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getVendorBookings()
        setBookings(Array.isArray(data) ? data : [])
      } catch (err) {
        setError("Failed to load chats")
        console.error("vendor bookings fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    void fetch()
  }, [profile?.uid])

  const threads = useMemo(
    () =>
      bookings
        .filter((b) => b.status === "accepted" || b.status === "confirmed")
        .map((b) => ({
          bookingId: String(b._id ?? b.id ?? ""),
          eventName: b.eventDetails?.type ?? "Booked Event",
          status: b.status ?? "",
          amount: Number(b.amount ?? 0),
        }))
        .filter((t) => Boolean(t.bookingId)),
    [bookings],
  )

  if (loading) return <PageCardSkeleton count={3} className="md:grid-cols-1" />

  if (error) {
    return (
      <ErrorState
        title="Could not load chats"
        description={error}
        onRetry={() => window.location.reload()}
        retryLabel="Retry"
      />
    )
  }

  if (!profile?.uid || threads.length === 0) {
    return (
      <EmptyState
        title="No chats yet"
        description="Accepted bookings will appear here for vendor messaging."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Client Chats</h1>
        <p className="theme-muted mt-2 text-sm">Open a booking to continue chatting with the customer.</p>
      </div>

      <div className="space-y-3">
        {threads.map((thread) => (
          <button
            key={thread.bookingId}
            type="button"
            onClick={() => router.push(`/chat/${getChatIdForBooking(thread.bookingId)}`)}
            className="theme-card w-full rounded-2xl p-5 text-left transition hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{thread.eventName}</p>
                <p className="theme-muted mt-1 text-sm">Chat with Customer</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  thread.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {thread.status === "confirmed" ? "Confirmed" : "Awaiting Payment"}
                </span>
                <p className="theme-muted text-xs mt-1">₹{thread.amount.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="theme-card p-8">Loading messages...</div>}>
      <MessagesPageContent />
    </Suspense>
  )
}
