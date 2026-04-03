"use client"

import { motion } from "framer-motion"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useEvent } from "@/context/EventContext"
import {
  getChatIdForBooking as getChatIdForRequest,
  initializeChatThread,
  sendChatMessage,
  subscribeToChatMessages,
  type ChatMessage,
} from "@/lib/chat"

function MessagesPageContent() {
  const { profile } = useAuth()
  const { requests, vendors, events, bookings } = useEvent()
  const activeVendor = vendors.find((vendor) => vendor.userId === profile?.uid)
  const currentVendorId = activeVendor?.id
  const vendorRequests = currentVendorId
    ? requests.filter((request) => request.vendorId === currentVendorId && request.status === "accepted")
    : []
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")

  const activeRequestId =
    selectedRequestId ??
    vendorRequests.find((request) => {
      const booking = bookings.find((item) => item.requestId === request.id && item.id === bookingId)
      return Boolean(booking)
    })?.id ??
    vendorRequests[0]?.id ??
    null

  const activeRequest =
    vendorRequests.find((request) => request.id === activeRequestId) ?? vendorRequests[0]
  const activeEvent = events.find((event) => event.id === activeRequest?.eventId)
  const activeBooking = bookings.find((item) => item.requestId === activeRequest?.id)
  const activeBookingId = activeBooking?.id ?? bookingId ?? null
  const threads = useMemo(
    () =>
      vendorRequests.map((request) => ({
        request,
        event: events.find((item) => item.id === request.eventId),
        bookingId: bookings.find((item) => item.requestId === request.id)?.id ?? null,
      })),
    [bookings, events, vendorRequests],
  )

  useEffect(() => {
    if (!activeRequest || !profile?.uid || !activeVendor?.userId || !activeBookingId) {
      setMessages([])
      return
    }

    let unsubscribe: (() => void) | undefined

    void initializeChatThread({ bookingId: activeBookingId })
      .then(({ chatId }) => {
        unsubscribe = subscribeToChatMessages(chatId, setMessages)
      })
      .catch(() => {
        setMessages([])
      })

    return () => {
      unsubscribe?.()
    }
  }, [activeBookingId, activeRequest, activeVendor?.userId, profile?.uid])

  if (!activeRequest) {
    return (
      <div className="theme-card p-8">
        No client chats yet. Accept a request to unlock vendor messaging.
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.34fr_0.66fr]">
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        className="theme-card p-4"
      >
        <h2 className="mb-4 text-lg font-semibold">Active Client Chats</h2>
        <div className="space-y-3">
          {threads.map(({ request, event, bookingId: threadBookingId }) => {
            return (
              <button
                key={request.id}
                type="button"
                onClick={() => setSelectedRequestId(request.id)}
                className={`w-full rounded-xl p-4 text-left ${
                  activeRequest?.id === request.id ? "bg-[var(--primary-light)]" : "theme-surface"
                }`}
              >
                <p className="font-medium">{request.clientName}</p>
                <p className="theme-muted mt-1 text-sm">{event?.name}</p>
                <p className="theme-muted mt-1 text-xs">
                  {threadBookingId ? "Chat ready" : "Booking pending"}
                </p>
                <p className="theme-muted mt-2 text-xs">{request.createdAt}</p>
              </button>
            )
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        className="theme-card flex min-h-[32rem] flex-col justify-between p-6"
      >
        <div>
          <h1 className="text-xl font-semibold">{activeRequest.clientName}</h1>
          <p className="theme-muted mt-2 text-sm">
            {activeEvent?.name} • {activeVendor?.category ?? "Vendor"} conversation
          </p>
        </div>

        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-sm rounded-2xl p-4 ${
                message.senderId === profile?.uid
                  ? "ml-auto bg-[var(--primary)] text-white"
                  : "theme-surface"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Reply to client"
            className="input flex-1 p-3"
          />
          <button
            type="button"
            onClick={async () => {
              if (!activeRequest || !activeBookingId) return
              const { chatId } = await initializeChatThread({
                bookingId: activeBookingId,
              })

              void sendChatMessage({
                chatId,
                senderId: profile?.uid ?? "vendor",
                text: draft,
              })
              setDraft("")
            }}
            className="theme-button rounded-xl px-5"
          >
            Send
          </button>
        </div>
      </motion.div>
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
