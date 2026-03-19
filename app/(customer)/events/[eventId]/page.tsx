"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { useState } from "react"
import { useEvent } from "@/context/EventContext"
import { serviceCatalog } from "../../mockData"

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>()
  const {
    events,
    vendors,
    addServiceToEvent,
    getRequestForVendor,
    formatCurrency,
  } = useEvent()
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [query, setQuery] = useState("")
  const event = events.find((item) => item.id === params.eventId)

  if (!event) {
    notFound()
  }

  const selectedVendors = vendors.filter((vendor) => event.vendorIds.includes(vendor.id))
  const progress = Math.round((event.spent / event.budget) * 100)
  const filteredServices = serviceCatalog.filter((service) =>
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
  const recommendedVendors = vendors.filter((vendor) =>
    event.services.some((service) =>
      vendor.category.toLowerCase().includes(service.toLowerCase()) ||
      service.toLowerCase().includes(vendor.category.toLowerCase())
    )
  )

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="theme-card overflow-hidden"
      >
        <div className="relative h-72">
          <Image
            src={event.coverImage}
            alt={event.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.42fr]">
          <div>
            <span className="theme-pill px-3 py-1 text-xs font-semibold">
              {event.type}
            </span>
            <h1 className="mt-4 text-4xl font-bold">{event.name}</h1>
            <p className="theme-muted mt-3">
              {event.date} • {event.location} • {event.guests} guests
            </p>
            <p className="theme-muted mt-5 max-w-2xl">{event.notes}</p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowServiceModal(true)}
                className="theme-button rounded-full px-5 py-2 text-sm"
              >
                Add Service
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {event.services.map((service) => (
                <Link
                  key={service}
                  href={`/vendors?service=${encodeURIComponent(service)}`}
                  className="theme-surface rounded-full px-4 py-2 text-sm transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  {service}
                </Link>
              ))}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="theme-surface rounded-3xl p-6">
                <h2 className="text-lg font-semibold">Checklist</h2>
                <ul className="theme-muted mt-4 space-y-3 text-sm">
                  {event.checklist.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="theme-surface rounded-3xl p-6">
                <h2 className="text-lg font-semibold">Selected Vendors</h2>
                <div className="mt-4 space-y-3">
                  {selectedVendors.map((vendor) => (
                    <div key={vendor.id} className="rounded-2xl bg-white/70 p-4">
                      <p className="font-medium">{vendor.name}</p>
                      <p className="theme-muted mt-1 text-sm">{vendor.category}</p>
                      <p className="theme-primary mt-2 text-xs font-medium">
                        {getRequestForVendor(event.id, vendor.id)?.status === "accepted"
                          ? "Vendor Confirmed"
                          : "Request Sent"}
                      </p>
                    </div>
                  ))}
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
                  <span>{formatCurrency(event.spent)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Remaining</span>
                  <span>{formatCurrency(event.budget - event.spent)}</span>
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
                {recommendedVendors.length > 0 ? (
                  recommendedVendors.map((vendor) => (
                    <div key={vendor.id} className="rounded-2xl bg-white/70 p-4">
                      <p className="font-medium">{vendor.name}</p>
                      <p className="theme-muted mt-1 text-sm">{vendor.category}</p>
                    </div>
                  ))
                ) : (
                  <p className="theme-muted text-sm">
                    Add services to see smarter vendor suggestions.
                  </p>
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
              {filteredServices.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => {
                    addServiceToEvent(event.id, service)
                    setShowServiceModal(false)
                    setQuery("")
                  }}
                  className="theme-surface rounded-2xl px-4 py-4 text-left transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                >
                  <span className="font-medium">{service}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  )
}
