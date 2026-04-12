"use client"

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { apiFetch } from "@/app/lib/api"

export type ChatMessage = {
  id: string
  senderId: string
  text: string
  timestamp: Date | null
}

/** Primary: chat keyed by request ID (available as soon as request is accepted) */
export const getChatIdForRequest = (requestId: string) => `request-${requestId}`

/** Legacy: chat keyed by booking ID (kept for backward compat) */
export const getChatIdForBooking = (bookingId: string) => `booking-${bookingId}`

export const initializeChatThread = async ({
  requestId,
  bookingId,
}: {
  requestId?: string
  bookingId?: string
}) => {
  const body = requestId ? { requestId } : { bookingId }
  const fallback = requestId
    ? getChatIdForRequest(requestId)
    : getChatIdForBooking(bookingId ?? "")

  const response = await apiFetch("/chats/init", {
    method: "POST",
    body: JSON.stringify(body),
  }) as { chatId?: string }

  return {
    chatId: String(response?.chatId || fallback),
  }
}

export const subscribeToChatMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const messagesQuery = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp", "asc")
  )

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        senderId: String(data.senderId ?? ""),
        text: String(data.text ?? ""),
        timestamp: data.timestamp?.toDate?.() ?? null,
      } satisfies ChatMessage
    })

    callback(messages)
  })
}

export const sendChatMessage = async ({
  chatId,
  senderId,
  text,
}: {
  chatId: string
  senderId: string
  text: string
}) => {
  const trimmedText = text.trim()
  if (!trimmedText) return

  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    text: trimmedText,
    timestamp: serverTimestamp(),
  })
}
