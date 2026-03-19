"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useEvent } from "@/context/EventContext"
import {
  getChatIdForRequest,
  sendChatMessage,
  subscribeToChatMessages,
  type ChatMessage,
} from "@/lib/chat"

export default function MessagesPage() {
const { requests, vendors, events } = useEvent()
const currentVendorId = "2"
const vendorSenderId = `vendor:${currentVendorId}`
const vendorRequests = requests.filter((request) => request.vendorId === currentVendorId)
const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
const [messages, setMessages] = useState<ChatMessage[]>([])
const [draft, setDraft] = useState("")
const activeRequestId =
selectedRequestId && vendorRequests.some((request) => request.id === selectedRequestId)
? selectedRequestId
: vendorRequests[0]?.id ?? null
const activeRequest = vendorRequests.find((request) => request.id === activeRequestId) ?? vendorRequests[0]
const activeVendor = vendors.find((vendor) => vendor.id === currentVendorId)
const activeEvent = events.find((event) => event.id === activeRequest?.eventId)

useEffect(() => {
if (!activeRequest) return

return subscribeToChatMessages(getChatIdForRequest(activeRequest.id), setMessages)
}, [activeRequest])

return (
activeRequest ? (
<div className="grid gap-6 lg:grid-cols-[0.34fr_0.66fr]">
<motion.div initial={{ opacity:0, x:-18 }} animate={{ opacity:1, x:0 }} className="theme-card p-4">
<h2 className="mb-4 text-lg font-semibold">Active Client Chats</h2>
<div className="space-y-3">
{vendorRequests.map((request) => {
const event = events.find((item) => item.id === request.eventId)
return (
<button
key={request.id}
type="button"
onClick={() => setSelectedRequestId(request.id)}
className={`w-full rounded-xl p-4 text-left ${activeRequest?.id === request.id ? "bg-[var(--primary-light)]" : "theme-surface"}`}
>
<p className="font-medium">{request.clientName}</p>
<p className="theme-muted mt-1 text-sm">{event?.name}</p>
<p className="theme-muted mt-2 text-xs">{request.createdAt}</p>
</button>
)
})}
</div>
</motion.div>

<motion.div initial={{ opacity:0, x:18 }} animate={{ opacity:1, x:0 }} className="theme-card flex min-h-[32rem] flex-col justify-between p-6">
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
className={`max-w-sm rounded-2xl p-4 ${message.senderId === vendorSenderId ? "ml-auto bg-[var(--primary)] text-white" : "theme-surface"}`}
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
onClick={() => {
if (!activeRequest) return
sendChatMessage({
chatId: getChatIdForRequest(activeRequest.id),
senderId: vendorSenderId,
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
) : (
<div className="theme-card p-8">
No client chats yet. Accept a booking request to unlock vendor messaging.
</div>
)

)

}
