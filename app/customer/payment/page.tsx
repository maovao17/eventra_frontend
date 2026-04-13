"use client"

import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { apiFetch } from "@/app/lib/api"
import { useEvent } from "@/context/EventContext"
import { openRazorpayCheckout, calculatePlatformFee } from "@/lib/payment"
import type { Booking } from "@/app/types/eventra"
import { useToast } from "@/context/ToastContext"

const paymentMethods = [
  "UPI",
  "Card",
  "Net Banking"
]

function PaymentsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { profile } = useAuth()
  const { formatCurrency, refreshData } = useEvent()
  const { showToast } = useToast()
  const requestId = searchParams.get("requestId")
  const [request, setRequest] = useState<null | { status?: string; amount?: number; vendorId?: string; packageName?: string }>(null)
  const [booking, setBooking] = useState<null | Booking>(null)
  const [resolvedAmount, setResolvedAmount] = useState(0)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!requestId) {
        setError("No request selected for payment.")
        setLoading(false)
        return
      }

      try {
        const requestData = await apiFetch(`/requests/${requestId}`) as { status?: string; amount?: number; vendorId?: string; packageName?: string }
        setRequest(requestData)

        const bookingResponse = await apiFetch(`/bookings/by-request/${requestId}`)
        const raw = bookingResponse as (Booking & { _id?: string }) | null
        let normalizedBooking: Booking | null = null
        if (raw) {
          normalizedBooking = { ...raw, id: raw.id || raw._id || "" }
          setBooking(normalizedBooking)
        } else {
          setBooking(null)
        }

        // Resolve amount: booking → request → vendor package fallback
        let amount = Number(normalizedBooking?.amount ?? 0) || Number(requestData?.amount ?? 0)
        if (amount === 0 && requestData?.vendorId) {
          try {
            const vendorData = await apiFetch(`/vendors/${requestData.vendorId}`) as any
            const packages: Array<{ name: string; price: number }> = vendorData?.packages ?? []
            const pkgName = requestData.packageName ?? ""
            const pkg =
              (pkgName && packages.find((p) => p.name === pkgName && Number(p.price) > 0)) ||
              packages.find((p) => Number(p.price) > 0)
            if (pkg) amount = Number(pkg.price)
          } catch { /* ignore */ }
        }
        setResolvedAmount(amount)
      } catch {
        setError('Could not load payment details')
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [requestId])

  const total = resolvedAmount
  const platformFee = calculatePlatformFee(total)
  const finalTotal = total + platformFee

  const handlePayment = async () => {
    try {
      setError("")
      if (!profile?.uid) throw new Error('Please log in to continue.')
      if (!requestId || !request) throw new Error('Request not loaded')
      if (request.status !== 'accepted') {
        throw new Error('Waiting for vendor approval')
      }
      if (!booking || !booking.id) {
        throw new Error('Booking is not ready for payment')
      }
      if (booking.status !== 'accepted') {
        throw new Error('This booking is no longer awaiting payment.')
      }
      if (booking.paymentStatus === 'paid') {
        throw new Error('Payment has already been completed for this booking.')
      }

      setSubmitting(true)
      await openRazorpayCheckout({
        amount: finalTotal,
        bookingId: booking.id,
        customerName: profile.name,
        customerPhone: profile.phone,
        onSuccess: async (payment) => {
          await refreshData()
          showToast("Payment successful", "success")
          router.push(
            `/customer/confirmation?bookingId=${booking.id}&paymentId=${payment.paymentId ?? ""}`
          )
        },
        onError: (message) => {
          setError(message)
        },
      })
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

  if (!request || request.status !== "accepted") {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Waiting for vendor approval.</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted">Your booking is being set up. Please wait a moment and try again.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="theme-button rounded-xl px-6 py-3"
        >
          Refresh
        </button>
      </div>
    )
  }

  if (booking.paymentStatus === "paid" || booking.status === "confirmed") {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Payment has already been completed for this booking.</p>
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
            <span className="text-sm">Vendor service</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
          <div className="border-t pt-4 flex justify-between items-center">
            <span className="font-medium">Subtotal</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
          {platformFee > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm theme-muted">Platform Fee (10%)</span>
              <span className="text-sm theme-muted">{formatCurrency(platformFee)}</span>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-[linear-gradient(135deg,var(--secondary),#4f8e89)] p-6 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">
            Amount Due
          </p>
          <p className="mt-4 text-4xl font-bold">{formatCurrency(finalTotal)}</p>
          <p className="mt-3 text-sm text-white/80">
            Total amount due for this booking.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePayment}
          disabled={submitting || total === 0}
          className="theme-button mt-8 rounded-xl px-6 py-3 disabled:opacity-50"
        >
          {submitting ? "Processing..." : "Confirm Payment"}
        </button>
      </motion.div>
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="theme-card p-8">Loading payment details...</div>}>
      <PaymentsPageContent />
    </Suspense>
  )
}
