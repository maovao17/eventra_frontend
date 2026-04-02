"use client"

import { FormEvent, Suspense, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useEvent } from "@/context/EventContext"
import { apiFetch } from "@/app/lib/api"

function ReviewPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { profile } = useAuth()
  const { bookings, formatCurrency } = useEvent()
  const bookingId = searchParams.get("bookingId")
  const [booking, setBooking] = useState<any>(null)
  const [rating, setRating] = useState("5")
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError("No booking selected for review.")
        setLoading(false)
        return
      }

      const localBooking = bookings.find((item) => item.id === bookingId)
      if (localBooking) {
        setBooking(localBooking)
        setLoading(false)
        return
      }

      try {
        const response = await apiFetch(`/bookings/${bookingId}`)
        setBooking(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load booking.")
      } finally {
        setLoading(false)
      }
    }

    void fetchBooking()
  }, [bookingId, bookings])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      setError("")
      setSuccess("")

      if (!profile?.uid) {
        throw new Error("Please log in to continue.")
      }

      if (!booking) {
        throw new Error("Booking not found.")
      }

      if (booking.status !== "completed") {
        throw new Error("Review only available after event completion.")
      }

      await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({
          bookingId: booking.id ?? booking._id,
          customerId: profile.uid,
          vendorId: booking.vendorId,
          rating: Number(rating),
          comment,
        }),
      })

      setSuccess("Review submitted successfully!")
      setTimeout(() => {
        router.push("/customer/dashboard")
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit review.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="theme-card p-8">Loading review details...</div>
  }

  if (!booking) {
    return <div className="theme-card p-8">{error || "Booking not found."}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="theme-card mx-auto max-w-2xl p-8"
    >
      <h1 className="text-3xl font-bold">Leave a Review</h1>
      <p className="theme-muted mt-3">
        Booking amount: {formatCurrency(Number(booking.amount ?? 0))}
      </p>
      <p className="theme-muted mt-1">
        Review is available only after event completion.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="input w-full p-3"
          >
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input min-h-32 w-full p-3"
            placeholder="Share your experience"
          />
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {success ? <p className="text-sm text-green-600">{success}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="theme-button rounded-xl px-6 py-3"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </motion.div>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="theme-card p-8">Loading review details...</div>}>
      <ReviewPageContent />
    </Suspense>
  )
}
