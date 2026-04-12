"use client"

import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { apiFetch } from "@/app/lib/api"
import { useEvent } from "@/context/EventContext"

function ConfirmationPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { formatCurrency } = useEvent()
  const bookingId = searchParams.get("bookingId")
  const paymentId = searchParams.get("paymentId")
  const [booking, setBooking] = useState<any>(null)
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookingId) {
      setLoading(false)
      return
    }
    const load = async () => {
      try {
        const b = await apiFetch(`/bookings/${bookingId}`) as any
        setBooking(b)
        if (b?.vendorId) {
          const v = await apiFetch(`/vendors/${b.vendorId}`).catch(() => null) as any
          setVendor(v)
        }
      } catch {
        // non-critical — page still renders without details
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [bookingId])

  const amount = booking?.amount ?? 0
  const platformFee = 2500
  const total = amount + platformFee

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl space-y-6"
    >
      {/* Success banner */}
      <div className="theme-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
        <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
        <p className="theme-muted mt-3">
          Your payment was successful and the booking is now confirmed.
        </p>
        {paymentId && (
          <p className="mt-2 text-xs theme-muted font-mono">
            Payment ID: {paymentId}
          </p>
        )}
      </div>

      {/* Booking details */}
      {!loading && booking && (
        <div className="theme-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Booking Summary</h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="theme-muted">Vendor</p>
              <p className="font-medium mt-1">
                {vendor?.businessName || vendor?.name || "Vendor"}
              </p>
            </div>
            <div>
              <p className="theme-muted">Category</p>
              <p className="font-medium mt-1 capitalize">
                {Array.isArray(vendor?.category)
                  ? vendor.category[0]
                  : vendor?.category || "—"}
              </p>
            </div>
            <div>
              <p className="theme-muted">Event Date</p>
              <p className="font-medium mt-1">
                {booking.date
                  ? new Date(booking.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "TBD"}
              </p>
            </div>
            <div>
              <p className="theme-muted">Location</p>
              <p className="font-medium mt-1">{booking.location || booking.eventDetails?.location || "TBD"}</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="theme-muted">Booking amount</span>
              <span>{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="theme-muted">Platform fee</span>
              <span>{formatCurrency(platformFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total paid</span>
              <span className="theme-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">What happens next?</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Chat with your vendor to coordinate event details.</li>
              <li>The vendor will mark the booking complete after the event.</li>
              <li>You can then leave a review for the vendor.</li>
              <li>Eventra releases the vendor payout after completion.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        {bookingId && (
          <button
            type="button"
            onClick={() => router.push(`/chat/booking-${bookingId}`)}
            className="theme-button rounded-xl px-6 py-3"
          >
            Chat with Vendor
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push("/customer/dashboard")}
          className="rounded-xl border px-6 py-3 text-sm font-medium"
        >
          Back to Dashboard
        </button>
        <button
          type="button"
          onClick={() => router.push("/customer/events")}
          className="rounded-xl border px-6 py-3 text-sm font-medium"
        >
          My Events
        </button>
      </div>
    </motion.div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="theme-card p-8 text-center">Loading confirmation...</div>}>
      <ConfirmationPageContent />
    </Suspense>
  )
}
