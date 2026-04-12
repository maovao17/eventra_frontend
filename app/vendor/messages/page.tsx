"use client"

import { Suspense, useMemo, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useEvent } from "@/context/EventContext"
import { EmptyState, PageCardSkeleton } from "@/components/ui/PageState"
import { getChatIdForBooking } from "@/lib/chat"
import { getVendorBookings } from "@/app/lib/vendorApi"
import type { Booking } from "@/app/types/eventra"

function MessagesPageContent() {
  const router = useRouter()
  const { profile } = useAuth()
  const { bookings: contextBookings, events, isLoading: contextLoading } = useEvent()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  // *** ADDED: Local state for vendor bookings ***
const [vendorBookings, setVendorBookings] = useState<Booking[]>([])
  const [vendorLoading, setVendorLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // *** UPDATED: Merge context + vendor bookings ***
  const allBookings = useMemo(() => [...contextBookings, ...vendorBookings], [contextBookings, vendorBookings])

  const threads = useMemo(
    () =>
      allBookings
        .filter((booking) => booking.status === "accepted" || booking.status === "confirmed")
        .map((booking) => ({
          bookingId: String(booking.id ?? booking._id ?? ""),
          eventName:
            events.find((event) => event.id === booking.eventId)?.name ?? "Booked Event",
          status: booking.status,
          amount: Number(booking.amount ?? 0),
        }))
        .filter((thread) => Boolean(thread.bookingId)),
    [allBookings, events],  // *** CHANGED: Use allBookings ***
  )

  // *** ADDED: Fetch vendor bookings on mount ***
  useEffect(() => {
    const fetchBookings = async () => {
      if (!profile?.uid || vendorLoading || vendorBookings.length > 0) return
      
      setVendorLoading(true)
      setFetchError(null)
      
      try {
        console.log("📡 Fetching vendor bookings for messages page")
        const fetched = await getVendorBookings()
        setVendorBookings(fetched)
      } catch (error) {
        console.error("Failed to fetch vendor bookings:", error)
        setFetchError("Failed to load bookings")
      } finally {
        setVendorLoading(false)
      }
    }

    fetchBookings()
  }, [profile?.uid, vendorLoading, vendorBookings.length])

  // *** UPDATED: Combined loading state ***
  if (contextLoading || vendorLoading) {
    return <PageCardSkeleton count={3} className="md:grid-cols-1" />
  }

  if (!profile?.uid || threads.length === 0) {
    return (
      <EmptyState
        title={fetchError ? "Error Loading Chats" : "No chats yet"}
        description={fetchError || "Accepted bookings will appear here for vendor messaging."}
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
        {threads.map((thread) => {
          const isSelected = bookingId === thread.bookingId
          return (
            <button
              key={thread.bookingId}
              type="button"
              onClick={() => router.push(`/chat/${getChatIdForBooking(thread.bookingId)}`)}
              className={`theme-card w-full rounded-2xl p-5 text-left transition ${
                isSelected ? "ring-2 ring-[var(--primary)]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{thread.eventName}</p>
                  <p className="theme-muted mt-1 text-sm">Chat with Customer</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize">{thread.status}</p>
                  <p className="theme-muted text-xs">Rs. {thread.amount.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </button>
          )
        })}
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

