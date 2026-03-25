"use client"

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export type ChatMessage = {
  id: string
  senderId: string
  text: string
  timestamp: Date | null
}

export const getChatIdForRequest = (requestId: string) => `chat-${requestId}`

export const initializeChatThread = async ({
  chatId,
  requestId,
  bookingId,
  participantIds,
}: {
  chatId: string
  requestId: string
  bookingId?: string
  participantIds: string[]
}) => {
  await setDoc(
    doc(db, "chats", chatId),
    {
      requestId,
      bookingId: bookingId ?? null,
      participantIds,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
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

  await setDoc(
    doc(db, "chats", chatId),
    {
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId,
    text: trimmedText,
    timestamp: serverTimestamp(),
  })
}
