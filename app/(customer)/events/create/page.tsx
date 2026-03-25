"use client"

import { useAuth } from "@/context/AuthContext"
import { useEvent } from "@/context/EventContext"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Suspense, useState, useEffect } from "react"
import { validateEvent } from "@/lib/validation/eventValidation"
import { getServicesForTemplate } from "@/lib/templates"

function CreateEventForm() {
  const { profile } = useAuth()
  const { createEvent } = useEvent()
  const router = useRouter()
  const params = useSearchParams()
  const type = params.get("type")

  // State for form fields
  const [eventName, setEventName] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [budget, setBudget] = useState("")
  const [services, setServices] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Initialize services based on template type
  useEffect(() => {
    const templateServices = getServicesForTemplate(type)
    setServices(templateServices)
  }, [type])

  const handleCreate = async () => {
    // Validate budget before creating payload
    const budgetNum = Number(budget)
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setErrors({ budget: "Valid budget required" })
      return
    }

    const payload = {
      name: eventName,
      date: eventDate,
      budget: budgetNum,
      services,
    }

    const validationErrors = validateEvent(payload)

    // ✅ Only block if REAL errors exist
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setApiError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch("http://localhost:3002/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || "Failed to create event")
        return;
      }

      setSuccess("Event created successfully!")
      setTimeout(() => {
        router.push('/events')
      }, 800)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const addService = (serviceName: string) => {
    if (!services.includes(serviceName)) {
      setServices([...services, serviceName])
    }
  }

  const removeService = (serviceName: string) => {
    setServices(services.filter(s => s !== serviceName))
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="theme-card p-8"
      >
        <p className="theme-primary mb-2 text-sm font-semibold uppercase tracking-[0.2em]">
          Event Builder
        </p>
        <h1 className="text-3xl font-bold mb-2">
          {type ? `${type} Event Planner` : "Create Event"}
        </h1>

        <p className="theme-muted mb-8">
          Build the planning shell now. Vendor APIs, availability sync, and
          payments can plug into this flow later without changing the UI.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Event Name</label>
            <input
              placeholder="Sunset wedding at Goa"
              className={`input p-3 ${errors.name ? "border-red-500" : ""}`}
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Event Date</label>
            <input
              type="date"
              className={`input p-3 ${errors.date ? "border-red-500" : ""}`}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
            {errors.date && (
              <p className="text-red-500 text-sm">{errors.date}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Budget</label>
            <input
              placeholder="850000"
              className={`input p-3 ${errors.budget ? "border-red-500" : ""}`}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            {errors.budget && (
              <p className="text-red-500 text-sm">{errors.budget}</p>
            )}
          </div>

          {/* Services Section */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Services {type ? `(Pre-filled for ${type})` : '(Add services)'}
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {services.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 transition-all duration-300 ease-in-out"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => removeService(service)}
                    className="ml-1 text-blue-600 transition-all duration-300 ease-in-out hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Quick add buttons for common services */}
            {!type && (
              <div className="flex flex-wrap gap-2">
                {['Catering', 'Decoration', 'Photography', 'DJ', 'Cake', 'Entertainment'].map((service) => (
                  !services.includes(service) && (
                    <button
                      key={service}
                      type="button"
                      onClick={() => addService(service)}
                      className="rounded-full border border-gray-300 px-3 py-1 text-sm transition-all duration-300 ease-in-out hover:bg-gray-50"
                    >
                      + {service}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        {apiError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{apiError}</p>
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="theme-button mt-8 rounded-lg px-6 py-3 transition-all duration-300 ease-in-out hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Create Event'}
        </button>
      </motion.div>

      <motion.aside
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="space-y-6"
      >
        <div className="theme-card p-6">
          <p className="theme-primary text-sm font-semibold uppercase tracking-[0.2em]">
            Preview
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            {eventName || `${type ?? "Custom"} Celebration`}
          </h2>
          <p className="theme-muted mt-3">
            Date: {eventDate || "Date pending"}
          </p>
          <p className="mt-2 text-sm font-medium">
            Budget: {budget ? `₹${budget}` : "To be defined"}
          </p>
          {services.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-1">Services:</p>
              <div className="flex flex-wrap gap-1">
                {services.map((service) => (
                  <span key={service} className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="theme-card p-6">
          <p className="theme-primary text-sm font-semibold uppercase tracking-[0.2em]">
            Next Steps
          </p>
          <ul className="mt-3 space-y-2 text-sm theme-muted">
            <li>• Select services for your event</li>
            <li>• Browse and request vendors</li>
            <li>• Confirm bookings after approval</li>
            <li>• Manage payments and finalize</li>
          </ul>
        </div>
      </motion.aside>
    </div>
  )
}

export default function CreateEvent() {
  return (
    <Suspense fallback={<div className="theme-card p-6">Loading event planner...</div>}>
      <CreateEventForm />
    </Suspense>
  )
}
