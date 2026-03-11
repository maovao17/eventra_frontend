"use client"

import { motion } from "framer-motion"
import { useEvent } from "@/context/EventContext"

const paymentMethods = [
  "UPI",
  "Card",
  "Net Banking"
]

export default function PaymentsPage() {
  const { checkoutTotal, formatCurrency } = useEvent()
  const total = checkoutTotal + 2500

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
          Payment UI is ready for gateway integration. Swap the placeholder
          action with your future Razorpay, Stripe, or Firebase Cloud Function.
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08 }}
        className="theme-card p-8"
      >
        <h2 className="text-2xl font-semibold">Payment Summary</h2>
        <div className="mt-6 rounded-2xl bg-[linear-gradient(135deg,var(--secondary),#4f8e89)] p-6 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">
            Amount Due
          </p>
          <p className="mt-4 text-4xl font-bold">{formatCurrency(total)}</p>
          <p className="mt-3 text-sm text-white/80">
            Includes booking total and platform coordination fee.
          </p>
        </div>

        <button className="theme-button mt-8 rounded-xl px-6 py-3">
          Confirm Payment
        </button>
      </motion.div>
    </div>
  )
}
