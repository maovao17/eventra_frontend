"use client"

import { Suspense, useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState"
import { getChatIdForBooking } from "@/lib/chat"
import { apiFetch } from "@/app/lib/api"

type EmbeddedBooking = {
  _id?: string
  id?: string
  status?: string
  amount?: number
}

type VendorRequest = {
  _id: string
  status: string
  booking?: EmbeddedBooking | null
  event?: { name?: string; eventType?: string }
  customer?: { name?: string }
}

function MessagesPageContent() {
  const router = useRouter()
  const { profile } = useAuth()

  const [requests, setRequests] = useState<VendorRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile?.uid) return

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // /requests/vendor returns requests WITH embedded booking (works on current backend)
        const data = await apiFetch("/requests/vendor")
        setRequests(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("vendor requests fetch error:", err)
        setError("Failed to load chats")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [profile?.uid])

  const threads = useMemo(
    () =>
      requests
        .filter(
          (r) =>
            r.booking &&
            (r.booking.status === "accepted" || r.booking.status === "confirmed"),
        )
        .map((r) => ({
          bookingId: String(r.booking!._id ?? r.booking!.id ?? ""),
          customerName: r.customer?.name ?? "Customer",
          eventName: r.event?.name ?? r.event?.eventType ?? "Booked Event",
          status: r.booking!.status ?? "",
          amount: Number(r.booking!.amount ?? 0),
        }))
        .filter((t) => Boolean(t.bookingId)),
    [requests],
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
        <p className="theme-muted mt-2 text-sm">
          Open a booking to continue chatting with your customer.
        </p>
      </div>

      <div className="space-y-3">
        {threads.map((thread) => (
          <button
            key={thread.bookingId}
            type="button"
            onClick={() =>
              router.push(`/chat/${getChatIdForBooking(thread.bookingId)}`)
            }
            className="theme-card w-full rounded-2xl p-5 text-left transition hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{thread.customerName}</p>
                <p className="theme-muted mt-1 text-sm">{thread.eventName}</p>
              </div>
              <div className="text-right space-y-1">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    thread.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {thread.status === "confirmed" ? "Confirmed" : "Awaiting Payment"}
                </span>
                <p className="theme-muted text-xs">
                  ₹{thread.amount.toLocaleString("en-IN")}
                </p>
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
