"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface EventData {
  _id: string
  name: string
  date: string
  budget: number
  services: string[]
  location?: string
  status?: string
  coverImage?: string
  notes?: string
  guests?: number
  type?: string
  checklist?: string[]
  vendorIds?: string[]
  spent?: number
}

interface VendorData {
  _id: string
  name: string
  category: string
  price: number
  image?: string
  responseTime?: string
}

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>()
  const [event, setEvent] = useState<EventData | null>(null)
  const [vendors, setVendors] = useState<VendorData[]>([])
  const [loading, setLoading] = useState(true)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [vendorsLoading, setVendorsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [query, setQuery] = useState("")
  const [availableServices, setAvailableServices] = useState<string[]>([])
  const [updatingService, setUpdatingService] = useState(false)
  const [success, setSuccess] = useState("")

  // Fetch event data on mount
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log("Fetching event...")
        const response = await fetch(`http://localhost:3002/events/${params.eventId}`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const eventData = await response.json()
        console.log("Event loaded:", eventData)
        setEvent(eventData)
      } catch (err) {
        console.error("Error fetching event:", err)
        setError(err instanceof Error ? err.message : "Failed to load event")
      } finally {
        setLoading(false)
      }
    }

    if (params.eventId) {
      fetchEvent()
    }
  }, [params.eventId])

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true)
        const response = await fetch("http://localhost:3002/services")
        if (response.ok) {
          const services = await response.json()
          setAvailableServices(services.map((s: any) => s.name || s))
        }
      } catch {
        // Fallback to common services
        setAvailableServices([
          "Catering", "Photography", "DJ", "Decoration", "Cake",
          "Entertainment", "Venue", "Transportation", "Lighting"
        ])
      } finally {
        setServicesLoading(false)
      }
    }

    fetchServices()
  }, [])

  useEffect(() => {
    if (!event || !event.services?.length) {
      setVendors([])
      return
    }

    const query = event.services.join(",")

    setVendorsLoading(true)
    fetch(`http://localhost:3002/vendors/by-services?services=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Filtered Vendors:", data)
        const sortedData = Array.isArray(data)
          ? [...data].sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0))
          : []
        setVendors(sortedData)
      })
      .catch((err) => {
        console.error("Error fetching vendors:", err)
      })
      .finally(() => {
        setVendorsLoading(false)
      })
  }, [event])

  const addService = async (serviceName: string) => {
    if (!event) return

    const currentServices = Array.isArray(event.services) ? event.services : []
    if (currentServices.includes(serviceName)) {
      setSuccess("Already added")
      return
    }

    const updatedServices = [...currentServices, serviceName]
    const previousServices = [...currentServices]

    setSuccess("")
    setError(null)

    // Optimistic update for instant feedback.
    setEvent((prev) => (prev ? { ...prev, services: updatedServices } : prev))
    setUpdatingService(true)
    try {
      const response = await fetch(`http://localhost:3002/events/${event._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ services: updatedServices }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update services: ${response.status}`)
      }

      setSuccess("Service added")
      setShowServiceModal(false)
      setQuery("")
    } catch (err) {
      console.error("Error updating services:", err)
      // Roll back optimistic change if API fails.
      setEvent((prev) => (prev ? { ...prev, services: previousServices } : prev))
      setError("Failed to add service")
    } finally {
      setUpdatingService(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="theme-card p-8">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-4 w-96 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 h-40 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="space-y-8">
        <div className="theme-card p-8">
          <h1 className="text-4xl font-bold">Event not found</h1>
          <p className="theme-muted mt-3">{error || "The event you're looking for doesn't exist."}</p>
        </div>
      </div>
    )
  }

  // Calculate progress based on services
  const totalExpectedServices = 8 // Adjust based on typical event needs
  const progress = Math.min(Math.round((event.services.length / totalExpectedServices) * 100), 100)

  const filteredServices = availableServices.filter((service) =>
    service.toLowerCase().includes(query.toLowerCase())
  )

  const timelineTasks = [
    {
      title: "6 Months Before",
      detail: "Book Venue",
      completed: event.services.some((service) =>
        service.toLowerCase().includes("venue")
      ),
    },
    {
      title: "4 Months Before",
      detail: "Photographer",
      completed: event.services.some((service) =>
        service.toLowerCase().includes("photo")
      ),
    },
    {
      title: "3 Months Before",
      detail: "Catering",
      completed: event.services.some((service) =>
        service.toLowerCase().includes("cater")
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="theme-card overflow-hidden"
      >
        <div className="relative h-72">
          <Image
            src={event.coverImage || "/HeroCard.avif"}
            alt={event.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.42fr]">
          <div>
            <span className="theme-pill px-3 py-1 text-xs font-semibold">
              {event.type || "Custom Event"}
            </span>
            <h1 className="mt-4 text-4xl font-bold">{event.name}</h1>
            <p className="theme-muted mt-3">
              {new Date(event.date).toLocaleDateString()} • {event.location || "Location TBD"} • {event.guests || 0} guests
            </p>
            <p className="theme-muted mt-5 max-w-2xl">{event.notes || "No additional notes."}</p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowServiceModal(true)}
                disabled={updatingService}
                className="theme-button rounded-full px-5 py-2 text-sm transition-all duration-300 ease-in-out hover:opacity-90 disabled:opacity-50"
              >
                {updatingService ? "Processing..." : "Add Service"}
              </button>
            </div>
            {success ? <p className="mt-3 text-sm text-green-500">{success}</p> : null}
            {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {event.services.map((service) => (
                <Link
                  key={service}
                  href={`/vendors?service=${encodeURIComponent(service)}`}
                  className="theme-surface rounded-full px-4 py-2 text-sm transition-all duration-300 ease-in-out hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  {service}
                </Link>
              ))}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="theme-surface rounded-3xl p-6">
                <h2 className="text-lg font-semibold">Checklist</h2>
                <ul className="theme-muted mt-4 space-y-3 text-sm">
                  {event.checklist && event.checklist.length > 0 ? (
                    event.checklist.map((item) => (
                      <li key={item}>• {item}</li>
                    ))
                  ) : (
                    <li>• Add services to build your checklist</li>
                  )}
                </ul>
              </div>

              <div className="theme-surface rounded-3xl p-6">
                <h2 className="text-lg font-semibold">Selected Vendors</h2>
                <div className="mt-4 space-y-3">
                  {vendorsLoading ? (
                    <div className="space-y-3">
                      {[...Array(2)].map((_, index) => (
                        <div key={index} className="h-16 animate-pulse rounded-2xl bg-gray-200" />
                      ))}
                    </div>
                  ) : vendors.length > 0 ? (
                    vendors.map((vendor) => (
                      <div key={vendor._id} className="rounded-2xl bg-white/70 p-4 transition-all duration-300 ease-in-out hover:shadow-lg">
                        <p className="font-medium">{vendor.name}</p>
                        <p className="theme-muted mt-1 text-sm">{vendor.category}</p>
                        <p className="theme-primary mt-2 text-xs font-medium">
                          {formatCurrency(vendor.price)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="theme-muted text-sm">
                      No vendors available for selected services
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="theme-surface rounded-3xl p-6">
              <p className="theme-muted text-sm">Planning Progress</p>
              <p className="mt-3 text-3xl font-bold">{progress}%</p>
              <div className="theme-progress-track mt-4 h-3 rounded-full">
                <div
                  className="h-3 rounded-full bg-[var(--primary)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="theme-surface rounded-3xl p-6">
              <h2 className="text-lg font-semibold">Budget Snapshot</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="theme-muted">Budget</span>
                  <span>{formatCurrency(event.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-muted">Spent</span>
                  <span>{formatCurrency(event.spent || 0)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Remaining</span>
                  <span>{formatCurrency(event.budget - (event.spent || 0))}</span>
                </div>
              </div>
            </div>

            <div className="theme-surface rounded-3xl p-6">
              <h2 className="text-lg font-semibold">Timeline</h2>
              <div className="mt-4 space-y-4">
                {timelineTasks.map((item) => (
                  <div key={item.title} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="theme-muted mt-1 text-sm">{item.detail}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.completed
                          ? "bg-[var(--primary-light)] text-[var(--primary)]"
                          : "theme-surface text-[var(--text-main)]"
                      }`}
                    >
                      {item.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="theme-surface rounded-3xl p-6">
              <h2 className="text-lg font-semibold">Recommended Vendors</h2>
              <div className="mt-4 space-y-3">
                {vendorsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="h-16 animate-pulse rounded-2xl bg-gray-200" />
                    ))}
                  </div>
                ) : vendors.length === 0 ? (
                  <p className="theme-muted text-sm">
                    Add services to see smarter vendor suggestions.
                  </p>
                ) : (
                  vendors.map((vendor) => (
                    <div key={vendor._id} className="rounded-2xl bg-white/70 p-4 transition-all duration-300 ease-in-out hover:shadow-lg">
                      <p className="font-medium">{vendor.name}</p>
                      <p className="theme-muted mt-1 text-sm">{vendor.category}</p>
                      <p className="theme-primary mt-2 text-xs font-medium">
                        {vendor.responseTime || "1 hour"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
              <h3 className="text-xl font-semibold">Add Service</h3>
              <button
                type="button"
                onClick={() => setShowServiceModal(false)}
                className="theme-muted text-sm"
              >
                Close
              </button>
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services"
              className="input mt-5 p-3"
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {servicesLoading ? (
                [...Array(6)].map((_, index) => (
                  <div key={index} className="h-12 animate-pulse rounded-2xl bg-gray-200" />
                ))
              ) : null}
              {filteredServices.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => addService(service)}
                  disabled={updatingService || event.services.includes(service)}
                  className="theme-surface rounded-2xl px-4 py-4 text-left transition-all duration-300 ease-in-out hover:bg-[var(--primary-light)] hover:text-[var(--primary)] disabled:opacity-50"
                >
                  <span className="font-medium">{service}</span>
                  {event.services.includes(service) && (
                    <span className="ml-2 text-xs text-green-600">Already added</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  )
}
