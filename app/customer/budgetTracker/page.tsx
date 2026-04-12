"use client"

import { motion } from "framer-motion"
import { useEvent } from "@/context/EventContext"

export default function BudgetTrackerPage() {
  const { currentEvent, formatCurrency, bookings, vendors } = useEvent()
  const event = currentEvent

  if (!event) {
    return <div className="theme-card p-6">Create an event to start tracking budget.</div>
  }

  const remaining = event.budget - event.spent

  // Build category spend from real bookings for this event, matched with vendor categories
  const eventBookings = bookings.filter((b) => b.eventId === (event.id || (event as any)._id))

  const categorySpendMap: Record<string, number> = {}
  for (const booking of eventBookings) {
    const vendor = vendors.find((v) => v.id === booking.vendorId || (v as any)._id === booking.vendorId)
    const category = vendor?.category || "Other"
    categorySpendMap[category] = (categorySpendMap[category] || 0) + booking.amount
  }

  const categorySpend = Object.entries(categorySpendMap)
    .sort(([, a], [, b]) => b - a)
    .map(([name, spent]) => ({ name, spent }))

  const budgetPerCategory = categorySpend.length > 0 ? event.budget / categorySpend.length : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Budget Tracker</h1>
        <p className="theme-muted">
          Monitor spend, remaining budget, and category-level burn across your
          event workflow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="theme-card p-6"
        >
          <p className="theme-muted text-sm">Total Budget</p>
          <p className="mt-3 text-3xl font-bold">{formatCurrency(event.budget)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="theme-card p-6"
        >
          <p className="theme-muted text-sm">Spent</p>
          <p className="theme-primary mt-3 text-3xl font-bold">
            {formatCurrency(event.spent)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="theme-card p-6"
        >
          <p className="theme-muted text-sm">Remaining</p>
          <p className={`mt-3 text-3xl font-bold ${remaining < 0 ? "text-red-500" : "theme-secondary"}`}>
            {formatCurrency(remaining)}
          </p>
        </motion.div>
      </div>

      {/* Overall progress */}
      <div className="theme-card p-6">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium">Overall Budget Used</span>
          <span className="theme-muted">
            {event.budget > 0 ? Math.round((event.spent / event.budget) * 100) : 0}%
          </span>
        </div>
        <div className="theme-progress-track h-3 w-full rounded-full">
          <div
            className={`h-3 rounded-full transition-all ${
              event.spent > event.budget ? "bg-red-500" : "bg-[var(--primary)]"
            }`}
            style={{ width: `${Math.min(event.budget > 0 ? (event.spent / event.budget) * 100 : 0, 100)}%` }}
          />
        </div>
        <p className="theme-muted text-xs mt-2">
          {formatCurrency(event.spent)} of {formatCurrency(event.budget)} used
        </p>
      </div>

      {/* Category Spend */}
      <div className="theme-card p-6">
        <h2 className="text-xl font-semibold mb-4">Category Spend</h2>
        {categorySpend.length === 0 ? (
          <p className="theme-muted text-sm">
            No confirmed bookings yet. Category spend will appear once you book vendors for this event.
          </p>
        ) : (
          <div className="space-y-5">
            {categorySpend.map((category) => {
              const progress = event.budget > 0
                ? Math.min((category.spent / event.budget) * 100, 100)
                : 0

              return (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{category.name}</span>
                    <span className="theme-muted">
                      {formatCurrency(category.spent)}
                      {budgetPerCategory > 0 && (
                        <span> of est. {formatCurrency(Math.round(budgetPerCategory))}</span>
                      )}
                    </span>
                  </div>
                  <div className="theme-progress-track h-3 w-full rounded-full">
                    <div
                      className="h-3 rounded-full bg-[var(--primary)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Booking breakdown */}
      {eventBookings.length > 0 && (
        <div className="theme-card p-6">
          <h2 className="text-xl font-semibold mb-4">Booking Breakdown</h2>
          <div className="space-y-3">
            {eventBookings.map((booking) => {
              const vendor = vendors.find(
                (v) => v.id === booking.vendorId || (v as any)._id === booking.vendorId
              )
              return (
                <div
                  key={booking._id || booking.id}
                  className="flex items-center justify-between rounded-xl border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{vendor?.name || "Vendor"}</p>
                    <p className="theme-muted text-xs">{vendor?.category || "Service"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(booking.amount)}</p>
                    <p className="theme-muted text-xs capitalize">{booking.status}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
