"use client"

import { useEvent } from "@/context/EventContext"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Suspense, useEffect, useMemo, useState } from "react"
import { validateEvent } from "@/lib/validation/eventValidation"
import { getServicesForTemplate } from "@/lib/templates"
import { getSuggestedServices, searchServiceCatalog } from "@/lib/serviceCatalog"
import { useToast } from "@/context/ToastContext"

function CreateEventForm() {
  const { createEvent } = useEvent()
  const router = useRouter()
  const params = useSearchParams()
  const type = params.get("type")
  const { showToast } = useToast()

  // State for form fields
  const [eventName, setEventName] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [budget, setBudget] = useState("")
  const [guests, setGuests] = useState("")
  const [services, setServices] = useState<string[]>([])
  const [serviceQuery, setServiceQuery] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const catalogResults = useMemo(
    () => searchServiceCatalog(serviceQuery),
    [serviceQuery]
  )
  const suggestedServices = useMemo(
    () => getSuggestedServices(services),
    [services]
  )

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
      const createdEvent = await createEvent({
        name: eventName,
        date: eventDate,
        budget: budget,
        guests,
        services,
        location: "",
        type,
      });

      if (!createdEvent) {
        setApiError("Failed to create event")
        showToast("Could not create the event. Please try again.", "error")
        return;
      }

      setSuccess("Event created successfully!")
      showToast("Event created successfully.", "success")
      setTimeout(() => {
        router.push(`/customer/events/${createdEvent.id}`)
      }, 800)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create event"
      setApiError(message)
      showToast(message, "error")
    } finally {
      setLoading(false)
    }
  }

  const addService = (serviceName: string) => {
    const normalizedName = serviceName.trim()
    if (!normalizedName) return

    if (!services.includes(normalizedName)) {
      setServices([...services, normalizedName])
      setServiceQuery("")
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
          Start with the essentials, add the services you need, and Eventra will
          take you straight into vendor discovery and booking.
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

          <div>
            <label className="mb-2 block text-sm font-medium">Expected Guests</label>
            <input
              placeholder="250"
              className="input p-3"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
            <p className="theme-muted mt-2 text-xs">
              Optional, but helpful for planning vendors and budgets realistically.
            </p>
          </div>

          {/* Services Section */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Services {type ? `(Pre-filled for ${type})` : "(Add services)"}
            </label>
            <div className="mb-3 flex flex-wrap gap-2">
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

            <div className="rounded-3xl border border-[#EAD7CF] bg-[#FFF9F6] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  placeholder="Search services like catering, DJ, mehendi, venue..."
                  className="input flex-1 p-3"
                />
                <button
                  type="button"
                  onClick={() => addService(serviceQuery)}
                  disabled={!serviceQuery.trim()}
                  className="rounded-full bg-[#E87D5F] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add Custom Service
                </button>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-[#5F514B]">Suggestions</p>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {(serviceQuery ? catalogResults : suggestedServices).slice(0, 9).map((service) => (
                    <button
                      key={service.name}
                      type="button"
                      onClick={() => addService(service.name)}
                      disabled={services.includes(service.name)}
                      className="rounded-2xl border border-[#EAD7CF] bg-white px-4 py-3 text-left transition hover:border-[#E87D5F] hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <p className="font-medium">{service.name}</p>
                      <p className="theme-muted mt-1 text-xs">{service.category}</p>
                    </button>
                  ))}
                </div>

                {!serviceQuery && suggestedServices.length === 0 ? (
                  <p className="theme-muted mt-3 text-sm">
                    You already added the common planning services. Add a custom one if needed.
                  </p>
                ) : null}

                {serviceQuery && catalogResults.length === 0 ? (
                  <p className="theme-muted mt-3 text-sm">
                    No exact match found. You can still add &quot;{serviceQuery.trim()}&quot; as a custom service.
                  </p>
                ) : null}
              </div>
            </div>
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
          {loading ? "Creating Event..." : "Create Event"}
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
          <p className="theme-muted mt-2 text-sm">
            Guests: {guests || "Estimate later"}
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
    <Suspense
      fallback={
        <div className="theme-card p-6">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-24 animate-pulse rounded bg-gray-100" />
        </div>
      }
    >
      <CreateEventForm />
    </Suspense>
  )
}
