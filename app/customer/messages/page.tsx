"use client"

import { Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useEvent } from "@/context/EventContext"
import { EmptyState, PageCardSkeleton } from "@/components/ui/PageState"
import { getChatIdForBooking } from "@/lib/chat"

function MessagesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile } = useAuth()
  const { bookings, vendors, isLoading } = useEvent()
  const bookingId = searchParams.get("bookingId")
  const chats = useMemo(
    () =>
      bookings
        .filter((booking) => booking.status === "accepted" || booking.status === "confirmed")
        .map((booking) => ({
          bookingId: String(booking.id ?? booking._id ?? ""),
          vendorName:
            vendors.find((vendor) => vendor.id === booking.vendorId)?.name ?? "Vendor",
          amount: Number(booking.amount ?? 0),
          status: booking.status,
        }))
        .filter((chat) => Boolean(chat.bookingId)),
    [bookings, vendors],
  )

  if (isLoading) {
    return <PageCardSkeleton count={3} className="md:grid-cols-1" />
  }

  if (!profile?.uid || chats.length === 0) {
    return (
      <EmptyState
        title="No chats yet"
        description="Chats unlock after a vendor accepts your booking."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vendor Chats</h1>
        <p className="theme-muted mt-2 text-sm">Select a booking to continue the conversation.</p>
      </div>

      <div className="space-y-3">
        {chats.map((chat) => {
          const isSelected = bookingId === chat.bookingId
          return (
            <button
              key={chat.bookingId}
              type="button"
              onClick={() => router.push(`/chat/${getChatIdForBooking(chat.bookingId)}`)}
              className={`theme-card w-full rounded-2xl p-5 text-left transition ${
                isSelected ? "ring-2 ring-[var(--primary)]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{chat.vendorName}</p>
                  <p className="theme-muted mt-1 text-sm">Chat with Vendor</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize">{chat.status}</p>
                  <p className="theme-muted text-xs">Rs. {chat.amount.toLocaleString("en-IN")}</p>
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
