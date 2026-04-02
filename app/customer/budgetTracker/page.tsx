"use client"

import { motion } from "framer-motion"
import { useEvent } from "@/context/EventContext"

const budgetCategories = [
  { name: "Photography", spent: 20000, limit: 60000 },
  { name: "Catering", spent: 35000, limit: 200000 },
  { name: "Decor", spent: 18000, limit: 120000 }
]

export default function BudgetTrackerPage() {
  const { currentEvent, formatCurrency } = useEvent()
  const event = currentEvent

  if (!event) {
    return <div className="theme-card p-6">Create an event to start tracking budget.</div>
  }

  const remaining = event.budget - event.spent

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
          <p className="theme-secondary mt-3 text-3xl font-bold">
            {formatCurrency(remaining)}
          </p>
        </motion.div>
      </div>

      <div className="theme-card p-6">
        <h2 className="text-xl font-semibold mb-4">Category Spend</h2>
        <div className="space-y-5">
          {budgetCategories.map((category) => {
            const progress = Math.min((category.spent / category.limit) * 100, 100)

            return (
              <div key={category.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{category.name}</span>
                  <span className="theme-muted">
                    {formatCurrency(category.spent)} / {formatCurrency(category.limit)}
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
      </div>
    </div>
  )
}
