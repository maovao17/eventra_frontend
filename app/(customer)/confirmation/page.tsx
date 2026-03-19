"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function ConfirmationPage() {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="theme-card mx-auto max-w-2xl p-8 text-center"
    >
      <h1 className="text-3xl font-bold">Payment Confirmed</h1>
      <p className="theme-muted mt-4">
        Your booking flow has been confirmed successfully.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/messages")}
          className="theme-button rounded-xl px-6 py-3"
        >
          Open Chat
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-xl border px-6 py-3"
        >
          Back to Dashboard
        </button>
      </div>
    </motion.div>
  )
}
