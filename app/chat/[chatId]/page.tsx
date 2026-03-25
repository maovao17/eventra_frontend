"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { ChatMessage, subscribeToChatMessages, sendChatMessage } from "@/lib/chat"
import { useRouter } from "next/navigation"

export default function ChatPage() {
  const params = useParams()
  const chatId = String(params.chatId || "")
  const { profile } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const senderId = profile?.uid

  if (!senderId) {
    useEffect(() => {
      router.push("/login")
    }, [])
    return <div>Redirecting to login...</div>
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!chatId) return

    setLoading(true)
    const unsubscribe = subscribeToChatMessages(chatId, (newMessages) => {
      setMessages(newMessages)
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [chatId])

  const handleSend = async () => {
    if (!inputText.trim() || !senderId || !chatId) return

    await sendChatMessage({
      chatId,
      senderId,
      text: inputText.trim(),
    })

    setInputText("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" &amp;&amp; !e.shiftKey) {
      e.preventDefault()
      handleSend()
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
                {message.timestamp &amp;&amp; (
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
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
