"use client"

import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { apiFetch } from "@/app/lib/api"
import { useEvent } from "@/context/EventContext"

const paymentMethods = [
  "UPI",
  "Card",
  "Net Banking"
]

export default function PaymentsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { profile } = useAuth()
  const { getBookingForRequest, formatCurrency, refreshData } = useEvent()
  const requestId = searchParams.get("requestId")
  const [request, setRequest] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) {
        setError("No request selected for payment.")
        setLoading(false)
        return
      }

      try {
        const requestData = await apiFetch(`/requests/${requestId}`)
        setRequest(requestData)
      } catch (err) {
        console.error('Failed to fetch request', err)
        setError('Could not load payment details')
      } finally {
        setLoading(false)
      }
    }
    void fetchRequest()
  }, [requestId])

  const booking = requestId ? getBookingForRequest(requestId) : undefined
  const total = booking?.amount ?? 0
  const finalTotal = total + 2500

  const handlePayment = async () => {
    try {
      setError("")
      if (!profile?.uid) throw new Error('Please log in to continue.')
      if (!requestId || !request) throw new Error('Request not loaded')
      if (request.status !== 'accepted') {
        throw new Error('Waiting for vendor approval')
      }
      if (!booking?.id) {
        throw new Error('Booking is not ready for payment')
      }

      setSubmitting(true)
      const payment = await apiFetch('/payments', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: booking.id,
          customerId: profile.uid,
          requestId,
          amount: finalTotal,
          status: 'success',
        }),
      })

      await refreshData()
      router.push(`/confirmation?bookingId=${booking.id}&paymentId=${payment._id}`)
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : 'Unable to start payment right now.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!request || !booking) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">{error || "No accepted booking is available for payment."}</p>
      </div>
    )
  }

  if (request.status !== "accepted") {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Waiting for vendor approval.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        className="theme-card p-8"
      >
        <p className="theme-primary text-sm font-semibold uppercase tracking-[0.2em]">
          Payment
        </p>
        <h1 className="mt-3 text-3xl font-bold">Secure payout flow</h1>
        <p className="theme-muted mt-3">
          Payment is available only after the vendor accepts your request.
        </p>

        <div className="mt-8 space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method}
              className="theme-surface flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left"
            >
              <span className="font-medium">{method}</span>
              <span className="theme-primary text-sm">Available</span>
            </button>
          ))}
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        ) : null}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08 }}
        className="theme-card p-8"
      >
        <h2 className="text-2xl font-semibold">Payment Summary</h2>
        
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Accepted booking</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
          <div className="border-t pt-4 flex justify-between items-center">
            <span className="font-medium">Subtotal</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted">Platform Fee</span>
            <span className="text-sm text-muted">{formatCurrency(2500)}</span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[linear-gradient(135deg,var(--secondary),#4f8e89)] p-6 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">
            Amount Due
          </p>
          <p className="mt-4 text-4xl font-bold">{formatCurrency(finalTotal)}</p>
          <p className="mt-3 text-sm text-white/80">
            Includes booking total and platform coordination fee.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePayment}
          disabled={submitting}
          className="theme-button mt-8 rounded-xl px-6 py-3"
        >
          {submitting ? "Processing..." : "Confirm Payment"}
        </button>
      </motion.div>
    </div>
  )
}
