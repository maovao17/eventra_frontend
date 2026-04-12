"use client"

import { Suspense, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useEvent } from "@/context/EventContext"
import { EmptyState, PageCardSkeleton } from "@/components/ui/PageState"
import { apiFetch } from "@/app/lib/api"
import { getChatIdForBooking } from "@/lib/chat"

function VendorMessagesContent() {
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
          const vendor = vendors.find((v) => v.id === String(booking.vendorId))
          const request = requests.find((r) => r.id === booking.requestId)
          const customer = vendors.find((v) => v.id === String(booking.customerId)) // Reuse vendors or add customers
          return {
            bookingId: String(booking.id ?? booking._id ?? ""),
            vendorName: vendor?.name ?? "Vendor",
            customerName: request?.clientName || "Customer",
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
        description="Chats appear after customers send requests and you accept them."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Chats</h1>
        <p className="theme-muted mt-2 text-sm">Manage chats and bookings with customers.</p>
      </div>

      <div className="space-y-3">
        {chats.map((chat) => {
          const isSelected = bookingId === chat.bookingId
          const canComplete = chat.status === "confirmed" && chat.paymentStatus === "paid"

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
                    <p className="font-semibold">{chat.customerName}</p>
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

                  {canComplete && (
                    <button className="rounded-xl bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium">
                      Mark Complete
                    </button>
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

export default function VendorMessagesPage() {
  return (
    <Suspense fallback={<div className="theme-card p-8">Loading messages...</div>}>
      <VendorMessagesContent />
    </Suspense>
  )
}
