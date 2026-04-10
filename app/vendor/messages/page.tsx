"use client"

import { Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useEvent } from "@/context/EventContext"
import { EmptyState, PageCardSkeleton } from "@/components/ui/PageState"
import { getChatIdForBooking } from "@/lib/chat"

function MessagesPageContent() {
  const router = useRouter()
  const { profile } = useAuth()
  const { bookings, events, isLoading } = useEvent()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const threads = useMemo(
    () =>
      bookings
        .filter((booking) => booking.status === "accepted" || booking.status === "confirmed")
        .map((booking) => ({
          bookingId: String(booking.id ?? booking._id ?? ""),
          eventName:
            events.find((event) => event.id === booking.eventId)?.name ?? "Booked Event",
          status: booking.status,
          amount: Number(booking.amount ?? 0),
        }))
        .filter((thread) => Boolean(thread.bookingId)),
    [bookings, events],
  )

  if (isLoading) {
    return <PageCardSkeleton count={3} className="md:grid-cols-1" />
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
