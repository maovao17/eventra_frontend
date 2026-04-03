"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { ChatMessage, subscribeToChatMessages, sendChatMessage } from "@/lib/chat"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/app/lib/api"
import { useToast } from "@/context/ToastContext"

export default function ChatPage() {
  const params = useParams()
  const chatId = String(params.chatId || "")
  const { profile } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(true)
  const [accessVerified, setAccessVerified] = useState<boolean | null>(null)
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const senderId = profile?.uid
  const { showToast } = useToast()
  const fallbackDashboard =
    profile?.role === "vendor"
      ? "/vendor/dashboard"
      : profile?.role === "admin"
        ? "/admin/dashboard"
        : "/customer/dashboard"

  useEffect(() => {
    if (!senderId) {
      router.push("/login")
      return
    }

    const verifyChatAccess = async () => {
      try {
        const response = await apiFetch(`/chats/${chatId}/verify`) as { allowed: boolean }
        if (response.allowed) {
          setAccessVerified(true)
        } else {
          setAccessVerified(false)
          setError("You don't have access to this chat")
        }
      } catch {
        setAccessVerified(false)
        setError("Unable to verify chat access")
      }
    }

    if (chatId) {
      verifyChatAccess()
    }
  }, [senderId, chatId, router])

  useEffect(() => {
    if (accessVerified === false) {
      router.push(`${fallbackDashboard}?error=chat-access-denied`)
    }
  }, [accessVerified, fallbackDashboard, router])

  if (!senderId) return <div>Redirecting to login...</div>

  if (accessVerified === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted">Verifying chat access...</p>
        </div>
      </div>
    )
  }

  if (accessVerified === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push(fallbackDashboard)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!chatId || accessVerified !== true) return

    setLoading(true)
    const unsubscribe = subscribeToChatMessages(chatId, (newMessages) => {
      setMessages(newMessages)
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [chatId, accessVerified])

  const sendMessage = async (text: string, isRetry = false) => {
    if (!text.trim() || !senderId || !chatId) return

    setSending(true)
    setSendError(false)
    try {
      await sendChatMessage({
        chatId,
        senderId,
        text: text.trim(),
      })

      setInputText("")
      if (isRetry) {
        showToast("Message sent successfully!", "success")
      }
    } catch (error: any) {
      setSendError(true)

      if (error.code === 'permission-denied') {
        showToast("You don't have permission to send messages in this chat", "error")
        setTimeout(() => {
          router.push("/customer/dashboard?error=chat-permission-denied")
        }, 2000)
      } else {
        showToast("Failed to send message. Please try again.", "error")
      }
    } finally {
      setSending(false)
    }
  }

  const handleSend = () => {
    void sendMessage(inputText)
  }

  const handleRetry = () => {
    void sendMessage(inputText, true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading chat...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center gap-3 shadow-sm z-10 sticky top-0 backdrop-blur-sm backdrop-bg-opacity-90 backdrop-filter backdrop-blur-lg border-gray-200">
        <button 
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-all"
        >
          ←
        </button>
        <h1 className="font-semibold text-lg">Chat</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === senderId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow ${
                  message.senderId === senderId
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                {message.timestamp && (
                  <p className={`text-xs mt-1 ${
                    message.senderId === senderId ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {(message.timestamp ?? new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4 shadow-lg z-20">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value)
              if (sendError) setSendError(false)
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={sending}
          />
          {sendError ? (
            <button
              onClick={handleRetry}
              disabled={sending || !inputText.trim()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {sending ? "Retrying..." : "Retry"}
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={sending || !inputText.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
