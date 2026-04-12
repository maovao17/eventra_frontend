"use client"

import { Suspense, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useEvent } from "@/context/EventContext"
import { EmptyState, PageCardSkeleton } from "@/components/ui/PageState"
import { apiFetch } from "@/app/lib/api"
import { getChatIdForBooking } from "@/lib/chat"

function MessagesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile } = useAuth()
  const { bookings, vendors, requests, isLoading, refreshData, formatCurrency } = useEvent()
  const bookingId = searchParams.get("bookingId")

  useEffect(() => {
    if (profile?.uid && refreshData) {
      refreshData()
    }
  }, [profile?.uid, refreshData])

  const chats = useMemo(
    () =>
      bookings
        .filter((booking) => ["accepted", "confirmed"].includes(booking.status?.toLowerCase() || ""))
        .map((booking) => {
          const vendor = vendors.find((v) => v.id === booking.vendorId || v._id === booking.vendorId)
          const request = requests.find((r) => r.id === booking.requestId)
          return {
            bookingId: String(booking.id ?? booking._id ?? ""),
            vendorName: vendor?.name ?? "Vendor",
            amount: Number(booking.amount ?? 0),
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            requestId: request?.id ?? "",
          }
        })
        .filter((chat) => Boolean(chat.bookingId)),
    [bookings, vendors, requests],
  )

  if (isLoading) {
    return <PageCardSkeleton count={3} className="md:grid-cols-1" />
  }

  if (!profile?.uid || chats.length === 0) {
    return (
      <EmptyState
        title="No chats yet"
        description="Chats unlock after a vendor accepts your booking. Go to Discover Vendors to send requests."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vendor Chats</h1>
        <p className="theme-muted mt-2 text-sm">Chat with vendors and pay to confirm your booking.</p>
      </div>

      <div className="space-y-3">
        {chats.map((chat) => {
          const isSelected = bookingId === chat.bookingId
          const canPay =
            chat.status === "accepted" && chat.paymentStatus !== "paid" && chat.requestId

          return (
            <div
              key={chat.bookingId}
              className={`theme-card rounded-2xl p-5 transition ${
                isSelected ? "ring-2 ring-[var(--primary)]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => router.push(`/chat/${getChatIdForBooking(chat.bookingId)}`)}
                  className="flex-1 text-left"
                >
                  <div>
                    <p className="font-semibold">{chat.vendorName}</p>
                    <p className="theme-muted mt-1 text-sm">
                      {chat.status === "accepted" ? "Awaiting payment" : "Booking confirmed"} •{" "}
                      {formatCurrency(chat.amount)}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await apiFetch("/chats/init", {
                          method: "POST",
                          body: JSON.stringify({ bookingId: chat.bookingId }),
                        });
                        router.push(`/chat/${res.chatId}`);
                      } catch (error) {
                        console.error("Failed to init chat:", error);
                      }
                    }}
                    className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Chat
                  </button>

                  {canPay && (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/customer/payment?requestId=${chat.requestId}`)
                      }
                      className="rounded-xl theme-button px-4 py-2 text-sm font-medium"
                    >
                      Pay Now
                    </button>
                  )}

                  {chat.status === "confirmed" && (
                    <span className="rounded-xl bg-green-100 text-green-800 px-3 py-2 text-sm font-medium">
                      Paid ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
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
