"use client"

import { Suspense, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useEvent } from "@/context/EventContext"
import { EmptyState, PageCardSkeleton } from "@/components/ui/PageState"
import { getChatIdForRequest } from "@/lib/chat"

function MessagesPageContent() {
  const router = useRouter()
  const { profile } = useAuth()
  const { requests, vendors, bookings, isLoading, refreshData, formatCurrency } = useEvent()

  useEffect(() => {
    if (profile?.uid && refreshData) {
      refreshData()
    }
  }, [profile?.uid, refreshData])

  const chats = useMemo(() => {
    return requests
      .filter((r) => r.status === "accepted")
      .map((r) => {
        const requestId = String((r as any)._id || r.id || "")
        const vendor = vendors.find(
          (v) => v._id === r.vendorId || v.id === r.vendorId,
        )
        // Check if there's an existing confirmed booking for this request
        const booking = bookings.find(
          (b) => b.requestId === requestId || b.requestId === r.id,
        )
        return {
          requestId,
          vendorName: vendor?.name ?? "Vendor",
          amount: Number(booking?.amount ?? (r as any).amount ?? 0),
          bookingStatus: booking?.status ?? null,
          paymentStatus: booking?.paymentStatus ?? null,
          isConfirmed: booking?.status === "confirmed" || booking?.paymentStatus === "paid",
        }
      })
      .filter((c) => Boolean(c.requestId))
  }, [requests, vendors, bookings])

  if (isLoading) {
    return <PageCardSkeleton count={3} className="md:grid-cols-1" />
  }

  if (!profile?.uid || chats.length === 0) {
    return (
      <EmptyState
        title="No chats yet"
        description="Once a vendor accepts your request, the chat will appear here."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vendor Chats</h1>
        <p className="theme-muted mt-2 text-sm">
          Chat with your vendors and confirm bookings when you're ready.
        </p>
      </div>

      <div className="space-y-3">
        {chats.map((chat) => (
          <div
            key={chat.requestId}
            className="theme-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Vendor info + tap to chat */}
              <button
                type="button"
                onClick={() =>
                  router.push(`/chat/${getChatIdForRequest(chat.requestId)}`)
                }
                className="flex-1 text-left"
              >
                <p className="font-semibold">{chat.vendorName}</p>
                <p className="theme-muted mt-1 text-sm">
                  {chat.isConfirmed
                    ? "Booking confirmed"
                    : "Tap to open chat"}{" "}
                  {chat.amount > 0 && `• ${formatCurrency(chat.amount)}`}
                </p>
              </button>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/chat/${getChatIdForRequest(chat.requestId)}`)
                  }
                  className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Chat
                </button>

                {!chat.isConfirmed && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/customer/payment?requestId=${chat.requestId}`,
                      )
                    }
                    className="rounded-xl theme-button px-4 py-2 text-sm font-medium"
                  >
                    Book Vendor
                  </button>
                )}

                {chat.isConfirmed && (
                  <span className="rounded-xl bg-green-100 text-green-800 px-3 py-2 text-sm font-medium">
                    Paid ✓
                  </span>
                )}
              </div>
            </div>
          </div>
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
