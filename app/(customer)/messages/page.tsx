"use client"

import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useEvent } from "@/context/EventContext"
import {
  getChatIdForRequest,
  sendChatMessage,
  subscribeToChatMessages,
  type ChatMessage,
} from "@/lib/chat"

export default function MessagesPage() {
  const { user } = useAuth()
  const { requests, vendors, events, currentEvent } = useEvent()
  const eventRequests = currentEvent
    ? requests.filter((request) => request.eventId === currentEvent.id)
    : requests
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const activeRequestId =
    selectedRequestId && eventRequests.some((request) => request.id === selectedRequestId)
      ? selectedRequestId
      : eventRequests[0]?.id ?? null
  const activeRequest =
    eventRequests.find((request) => request.id === activeRequestId) ?? eventRequests[0]
  const activeVendor = vendors.find((vendor) => vendor.id === activeRequest?.vendorId)
  const activeEvent = events.find((event) => event.id === activeRequest?.eventId)
  const threads = useMemo(
    () =>
      eventRequests.map((request) => {
        const vendor = vendors.find((item) => item.id === request.vendorId)
        return {
          id: request.id,
          vendorName: vendor?.name ?? "Vendor",
          preview: request.status === "pending" ? "Request sent" : "Chat unlocked",
          updatedAt: request.createdAt,
        }
      }),
    [eventRequests, vendors]
  )

  useEffect(() => {
    if (!activeRequest) return

    return subscribeToChatMessages(
      getChatIdForRequest(activeRequest.id),
      setActiveMessages
    )
  }, [activeRequest])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Vendor Chats
        </h1>
      </div>

      {eventRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="theme-card p-8"
        >
          Chat will unlock after a vendor accepts your request.
        </motion.div>
      ) : (
      <div className="grid gap-6 lg:grid-cols-[0.36fr_0.64fr]">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          className="theme-card p-4"
        >
          <h2 className="mb-4 text-lg font-semibold">Active Threads</h2>
          <div className="space-y-3">
            {threads.map((thread) => (
              <button
                type="button"
                onClick={() => setSelectedRequestId(thread.id)}
                key={thread.id}
                className={`w-full rounded-xl p-4 text-left ${
                  activeRequest?.id === thread.id ? "bg-[var(--primary-light)]" : "theme-surface"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{thread.vendorName}</p>
                  <span className="theme-muted text-xs">{thread.updatedAt}</span>
                </div>
                <p className="theme-muted mt-2 text-sm">{thread.preview}</p>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          className="theme-card flex min-h-[32rem] flex-col justify-between p-6"
        >
          <div>
            <h3 className="text-xl font-semibold">{activeVendor?.name}</h3>
            <p className="theme-muted mt-2 max-w-xl">
              Chat unlocked for {activeEvent?.name}. Messages update in realtime.
            </p>
          </div>

          <div className="space-y-3">
            {activeMessages.map((message) => (
              <div
                key={message.id}
                className={`max-w-sm rounded-2xl p-4 ${
                  message.senderId === user?.uid
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
              placeholder="Type a message"
              className="input flex-1 p-3"
            />
            <button
              type="button"
              onClick={async () => {
                if (!activeRequest) return
                await sendChatMessage({
                  chatId: getChatIdForRequest(activeRequest.id),
                  senderId: user?.uid ?? "customer",
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
      )}
    </div>
  );
}
