"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEvent } from "@/context/EventContext"

export default function CheckoutPage() {
  const router = useRouter()
  const { checkoutSummary, checkoutTotal, formatCurrency } = useEvent()
  const subtotal = checkoutTotal
  const platformFee = 2500
  const total = subtotal + platformFee

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="theme-card p-8"
      >
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="theme-muted mb-8">
          Review selected vendors and lock your booking summary before payment.
        </p>

        <div className="space-y-4">
          {checkoutSummary.map((item) => (
            <div
              key={item.requestId}
              className="theme-surface flex items-center justify-between rounded-2xl p-4"
            >
              <div>
                <p className="font-semibold">{item.vendorName}</p>
                <p className="theme-muted text-sm">{item.category}</p>
              </div>
              <p className="font-semibold">{formatCurrency(item.amount)}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.aside
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="theme-card p-8"
      >
        <h2 className="text-2xl font-semibold">Order Summary</h2>
        <div className="mt-6 space-y-3">
          <div className="flex justify-between">
            <span className="theme-muted">Vendor subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="theme-muted">Platform coordination fee</span>
            <span>{formatCurrency(platformFee)}</span>
          </div>
          <hr className="my-4" />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/payment")}
          className="theme-button mt-8 inline-block w-full rounded-xl py-3 text-center"
        >
          Pay Now
        </button>
      </motion.aside>
    </div>
  )
}
