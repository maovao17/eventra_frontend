"use client"

import { motion } from "framer-motion"
import { useMemo, useState } from "react"
import { useEvent } from "@/context/EventContext"

export default function MessagesPage() {
  const { requests, vendors, events, getMessagesForRequest, sendMessage } = useEvent()
  const acceptedRequests = requests.filter((request) => request.status === "accepted")
  const [activeRequestId, setActiveRequestId] = useState<string | null>(
    acceptedRequests[0]?.id ?? null
  )
  const activeRequest =
    acceptedRequests.find((request) => request.id === activeRequestId) ?? acceptedRequests[0]
  const activeVendor = vendors.find((vendor) => vendor.id === activeRequest?.vendorId)
  const activeEvent = events.find((event) => event.id === activeRequest?.eventId)
  const activeMessages = activeRequest ? getMessagesForRequest(activeRequest.id) : []
  const [draft, setDraft] = useState("")
  const threads = useMemo(
    () =>
      acceptedRequests.map((request) => {
        const vendor = vendors.find((item) => item.id === request.vendorId)
        return {
          id: request.id,
          vendorName: vendor?.name ?? "Vendor",
          preview: getMessagesForRequest(request.id).at(-1)?.text ?? "Chat unlocked",
          updatedAt: request.createdAt,
        }
      }),
    [acceptedRequests, getMessagesForRequest, vendors]
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Vendor Chats
        </h1>
      </div>

      {acceptedRequests.length === 0 ? (
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
                onClick={() => setActiveRequestId(thread.id)}
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
              Chat unlocked for {activeEvent?.name}. This shell is ready for future
              realtime transport and media attachments.
            </p>
          </div>

          <div className="space-y-3">
            {activeMessages.map((message) => (
              <div
                key={message.id}
                className={`max-w-sm rounded-2xl p-4 ${
                  message.sender === "customer"
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
              onClick={() => {
                if (!activeRequest) return
                sendMessage(activeRequest.id, "customer", draft)
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
