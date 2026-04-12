"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { ChatMessage, subscribeToChatMessages, sendChatMessage } from "@/lib/chat"
import { apiFetch } from "@/app/lib/api"
import { initializeChatThread } from "@/lib/chat"
import { useToast } from "@/context/ToastContext"

export default function ChatPage() {
  const params = useParams()
  const chatId = String(params.chatId || "")
  const { profile } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(true)
  const [accessVerified, setAccessVerified] = useState<boolean | null>(null)
  const [accessError, setAccessError] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const senderId = profile?.uid
  const fallbackDashboard =
    profile?.role === "vendor"
      ? "/vendor/dashboard"
      : profile?.role === "admin"
        ? "/admin/dashboard"
        : "/customer/dashboard"

  // ─── ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS ───

  // 1. Verify chat access
  useEffect(() => {
    if (!senderId) {
      router.push("/login")
      return
    }
    if (!chatId) return

    const verify = async () => {
      try {
        const res = await apiFetch(`/chats/${chatId}/verify`) as { allowed: boolean }
        if (!res.allowed) {
          setAccessVerified(false)
          setAccessError("You don't have access to this chat")
          return
        }
        // Lazy-init the Firestore chat doc if it doesn't exist yet
        const requestIdMatch = chatId.match(/^request-(.+)$/)
        const bookingIdMatch = chatId.match(/^booking-(.+)$/)
        if (requestIdMatch) {
          await initializeChatThread({ requestId: requestIdMatch[1] }).catch(() => null)
        } else if (bookingIdMatch) {
          await initializeChatThread({ bookingId: bookingIdMatch[1] }).catch(() => null)
        }
        setAccessVerified(true)
      } catch {
        setAccessVerified(false)
        setAccessError("Unable to verify chat access")
      }
    }

    void verify()
  }, [senderId, chatId, router])

  // 2. Redirect on denied
  useEffect(() => {
    if (accessVerified === false) {
      router.push(`${fallbackDashboard}?error=chat-access-denied`)
    }
  }, [accessVerified, fallbackDashboard, router])

  // 3. Subscribe to Firestore messages
  useEffect(() => {
    if (!chatId || accessVerified !== true) return

    setLoading(true)
    let unsub: (() => void) | null = null

    try {
      unsub = subscribeToChatMessages(chatId, (newMessages) => {
        setMessages(newMessages)
        setLoading(false)
      })
    } catch {
      setLoading(false)
    }

    return () => {
      unsub?.()
    }
  }, [chatId, accessVerified])

  // 4. Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ─── CONDITIONAL RENDERS ───

  if (!senderId) {
    return <div className="flex items-center justify-center min-h-screen theme-muted">Redirecting to login...</div>
  }

  if (accessVerified === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto" />
          <p className="mt-4 theme-muted">Verifying chat access...</p>
        </div>
      </div>
    )
  }

  if (accessVerified === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center theme-card p-8 rounded-2xl">
          <h2 className="text-xl font-semibold text-red-500">Access Denied</h2>
          <p className="mt-2 theme-muted">{accessError}</p>
          <button
            onClick={() => router.push(fallbackDashboard)}
            className="mt-4 theme-button rounded-xl px-6 py-2"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ─── HANDLERS ───

  const sendMessage = async (text: string) => {
    if (!text.trim() || !senderId || !chatId) return
    setSending(true)
    setSendError(false)
    try {
      await sendChatMessage({ chatId, senderId, text: text.trim() })
      setInputText("")
    } catch (err: any) {
      setSendError(true)
      if (err?.code === "permission-denied") {
        showToast("No permission to send messages in this chat", "error")
        setTimeout(() => router.push(`${fallbackDashboard}?error=chat-permission-denied`), 2000)
      } else {
        showToast("Failed to send message. Try again.", "error")
      }
    } finally {
      setSending(false)
    }
  }

  const handleSend = () => void sendMessage(inputText)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ─── RENDER ───

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="theme-card border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="theme-muted hover:text-[var(--primary)] p-1 rounded-full hover:bg-[var(--primary-light)] transition-all"
        >
          ←
        </button>
        <h1 className="font-semibold text-lg">Chat</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full theme-muted text-sm">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === senderId
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                    isOwn
                      ? "bg-[var(--primary)] text-white"
                      : "theme-surface"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.timestamp && (
                    <p className={`text-xs mt-1 ${isOwn ? "text-white/70" : "theme-muted"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="theme-card border-t p-4 sticky bottom-0 z-20">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value)
              if (sendError) setSendError(false)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
            disabled={sending}
          />
          <button
            onClick={sendError ? () => void sendMessage(inputText) : handleSend}
            disabled={sending || !inputText.trim()}
            className={`${
              sendError
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[var(--primary)] hover:bg-[var(--primary)]/90"
            } text-white px-6 py-3 rounded-2xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
          >
            {sending ? (sendError ? "Retrying..." : "Sending...") : sendError ? "Retry" : "Send"}
          </button>
        </div>
      </div>
    </div>
  )
}
