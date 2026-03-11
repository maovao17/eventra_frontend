"use client"

import { useEvent } from "@/context/EventContext"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Suspense, useState } from "react"
import { serviceCatalog } from "../../mockData"
import { validateEvent } from "@/lib/validation/eventValidation"

function CreateEventForm() {
  const { createEvent } = useEvent()
  const router = useRouter()
  const params = useSearchParams()
  const type = params.get("type")
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [location, setLocation] = useState("")
  const [budget, setBudget] = useState("")
  const [guests, setGuests] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedServices, setSelectedServices] = useState<string[]>(["Photographer", "Catering"])
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [serviceQuery, setServiceQuery] = useState("")

  const toggleService = (service: string) => {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service]
    )
  }

  const filteredServices = serviceCatalog.filter((service) =>
    service.toLowerCase().includes(serviceQuery.toLowerCase())
  )

  const handleCreate = () => {
    const validationErrors = validateEvent({ name, date, location, budget })
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Reserved for future API / Firebase event persistence.
    createEvent({
      name: name || `${type ?? "Custom"} Event`,
      date,
      location,
      budget,
      type,
      guests,
      services: selectedServices,
    })

    router.push("/events")
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
              onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setDate(e.target.value)}
            />
            {errors.date && (
              <p className="text-red-500 text-sm">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Guest Count</label>
            <input
              placeholder="220"
              className="input p-3"
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Location</label>
            <input
              placeholder="North Goa beachfront venue"
              className={`input p-3 ${errors.location ? "border-red-500" : ""}`}
              onChange={(e) => setLocation(e.target.value)}
            />
            {errors.location && (
              <p className="text-red-500 text-sm">{errors.location}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Budget</label>
            <input
              placeholder="850000"
              className={`input p-3 ${errors.budget ? "border-red-500" : ""}`}
              onChange={(e) => setBudget(e.target.value)}
            />
            {errors.budget && (
              <p className="text-red-500 text-sm">{errors.budget}</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Planning Modules</h2>
            <button
              type="button"
              onClick={() => setShowServiceModal(true)}
              className="theme-button rounded-full px-4 py-2 text-sm"
            >
              Add Service
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedServices.map((service) => {
              const selected = selectedServices.includes(service)

              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    selected
                      ? "bg-[var(--primary)] text-white"
                      : "theme-surface text-[var(--text-main)]"
                  }`}
                >
                  {service}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="theme-button mt-8 rounded-lg px-6 py-3"
        >
          Create Event
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
            {name || `${type ?? "Custom"} Celebration`}
          </h2>
          <p className="theme-muted mt-3">
            {location || "Location pending"} • {date || "Date pending"}
          </p>
          <p className="mt-4 text-sm font-medium">
            Guests: {guests || "TBD"}
          </p>
          <p className="mt-2 text-sm font-medium">
            Budget: {budget ? `₹${budget}` : "To be defined"}
          </p>
        </div>

        <div className="theme-card p-6">
          
        </div>
      </motion.aside>

      {showServiceModal ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="theme-card w-full max-w-xl p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Select Services</h3>
              <button
                type="button"
                onClick={() => setShowServiceModal(false)}
                className="theme-muted text-sm"
              >
                Close
              </button>
            </div>

            <input
              value={serviceQuery}
              onChange={(e) => setServiceQuery(e.target.value)}
              placeholder="Search services"
              className="input mt-5 p-3"
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {filteredServices.map((service) => {
                const selected = selectedServices.includes(service)

                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      selected
                        ? "bg-[var(--primary-light)] text-[var(--primary)]"
                        : "theme-surface"
                    }`}
                  >
                    <span className="font-medium">{service}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
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
