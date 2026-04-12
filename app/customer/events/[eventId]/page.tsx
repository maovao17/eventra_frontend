"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/app/lib/api"
import EventProgress from "@/components/event/EventProgress"
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState"
import { useEvent } from "@/context/EventContext"
import { useToast } from "@/context/ToastContext"
import { getSuggestedServices, searchServiceCatalog } from "@/lib/serviceCatalog"
import type { Vendor } from "@/app/types/eventra"

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)

const formatDisplayDate = (value: string) => {
  if (!value) return "Date pending"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date pending"

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

const buildRelativeLabel = (daysBefore: number) => {
  if (daysBefore >= 30) {
    const months = Math.round(daysBefore / 30)
    return `${months} month${months === 1 ? "" : "s"} before`
  }

  if (daysBefore >= 7) {
    const weeks = Math.round(daysBefore / 7)
    return `${weeks} week${weeks === 1 ? "" : "s"} before`
  }

  return `${daysBefore} day${daysBefore === 1 ? "" : "s"} before`
}

const getPlanningTimeline = (
  eventDate: string,
  serviceCount: number,
  requestCount: number,
  acceptedCount: number,
  paidCount: number
) => {
  const parsedDate = new Date(eventDate)
  const hasValidDate = !Number.isNaN(parsedDate.getTime())
  const checkpoints = [
    {
      offsetDays: 120,
      title: "Lock your essentials",
      detail: "Define your core services and shortlist the first vendors.",
      completed: serviceCount >= 3,
    },
    {
      offsetDays: 60,
      title: "Send requests",
      detail: "Reach out to matching vendors for the services you want.",
      completed: requestCount > 0,
    },
    {
      offsetDays: 30,
      title: "Confirm bookings",
      detail: "Move accepted requests into confirmed event partners.",
      completed: acceptedCount > 0,
    },
    {
      offsetDays: 7,
      title: "Finish payments",
      detail: "Complete payments and final coordination before the event.",
      completed: paidCount > 0,
    },
  ]

  return checkpoints.map((item) => ({
    ...item,
    label: hasValidDate
      ? `${buildRelativeLabel(item.offsetDays)} • ${formatDisplayDate(
          new Date(parsedDate.getTime() - item.offsetDays * 24 * 60 * 60 * 1000).toISOString(),
        )}`
      : buildRelativeLabel(item.offsetDays),
  }))
}

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>()
  const { showToast } = useToast()
  const {
    events,
    requests,
    bookings,
    services,
    addServiceToEvent,
    isLoading,
    refreshData,
    error,
  } = useEvent()

  const [showServiceModal, setShowServiceModal] = useState(false)
  const [serviceQuery, setServiceQuery] = useState("")
  const [updatingService, setUpdatingService] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [matchingVendors, setMatchingVendors] = useState<Vendor[]>([])
  const [vendorsLoading, setVendorsLoading] = useState(false)
  const [vendorError, setVendorError] = useState("")

  const event = useMemo(
    () => events.find((item) => item.id === String(params.eventId)) ?? null,
    [events, params.eventId],
  )

  const eventRequests = useMemo(
    () => requests.filter((request) => request.eventId === event?.id),
    [event?.id, requests],
  )

  const eventBookings = useMemo(
    () => bookings.filter((booking) => booking.eventId === event?.id),
    [bookings, event?.id],
  )

  const acceptedBookings = eventBookings.filter((booking) =>
    ["accepted", "confirmed", "completed"].includes(booking.status),
  )
  const paidBookings = eventBookings.filter((booking) => booking.paymentStatus === "paid")

  const progress = useMemo(() => {
    if (!event) return 0

    const serviceRatio = Math.min(event.services.length / 6, 1)
    const requestRatio = event.services.length
      ? Math.min(eventRequests.length / event.services.length, 1)
      : 0
    const bookingRatio = eventRequests.length
      ? Math.min(acceptedBookings.length / eventRequests.length, 1)
      : 0
    const paymentRatio = acceptedBookings.length
      ? Math.min(paidBookings.length / acceptedBookings.length, 1)
      : 0

    return Math.round(
      serviceRatio * 35 + requestRatio * 25 + bookingRatio * 25 + paymentRatio * 15,
    )
  }, [acceptedBookings.length, event, eventRequests.length, paidBookings.length])

  const dynamicTimeline = useMemo(
    () =>
      getPlanningTimeline(
        event?.date ?? "",
        event?.services.length ?? 0,
        eventRequests.length,
        acceptedBookings.length,
        paidBookings.length,
      ),
    [acceptedBookings.length, event?.date, event?.services.length, eventRequests.length, paidBookings.length],
  )

  const checklistItems = useMemo(() => {
    if (!event) return []

    return [
      event.services.length
        ? `${event.services.length} service${event.services.length === 1 ? "" : "s"} selected`
        : "Add services to start planning",
      eventRequests.length
        ? `${eventRequests.length} vendor request${eventRequests.length === 1 ? "" : "s"} sent`
        : "Send vendor requests for your services",
      acceptedBookings.length
        ? `${acceptedBookings.length} booking${acceptedBookings.length === 1 ? "" : "s"} accepted`
        : "Wait for vendors to accept your requests",
      paidBookings.length
        ? `${paidBookings.length} payment${paidBookings.length === 1 ? "" : "s"} completed`
        : "Complete payment to secure accepted bookings",
    ]
  }, [acceptedBookings.length, event, eventRequests.length, paidBookings.length])

  const backendServiceOptions = useMemo(
    () => services.map((service) => service.name),
    [services],
  )

  const catalogOptions = useMemo(
    () => searchServiceCatalog(serviceQuery).map((item) => item.name),
    [serviceQuery],
  )

  const suggestedOptions = useMemo(
    () => getSuggestedServices(event?.services ?? [], 10).map((item) => item.name),
    [event?.services],
  )

  const serviceOptions = useMemo(() => {
    if (!event) return []

    const base = serviceQuery ? catalogOptions : suggestedOptions
    const merged = Array.from(new Set([...base, ...backendServiceOptions]))

    return merged
      .filter((service) =>
        service.toLowerCase().includes(serviceQuery.trim().toLowerCase()),
      )
      .filter((service) => !event.services.includes(service))
      .slice(0, 12)
  }, [backendServiceOptions, catalogOptions, event, serviceQuery, suggestedOptions])

  useEffect(() => {
    const fetchMatchingVendors = async () => {
      if (!event?.services.length) {
        setMatchingVendors([])
        setVendorError("")
        return
      }

      setVendorsLoading(true)
      setVendorError("")

      try {
        const response = await apiFetch(
          `/vendors/by-services?services=${encodeURIComponent(event.services.join(","))}`,
        )

        if (!Array.isArray(response)) {
          throw new Error("Could not load vendors for the selected services.")
        }

        const normalized = response.map((vendor) => ({
          _id: vendor._id || vendor.id,
          id: String(vendor._id ?? vendor.id),
          userId: String(vendor.userId ?? ""),
          name: String(vendor.name ?? "Vendor"),
          category: String(vendor.category ?? "Vendor Service"),
          location:
            typeof vendor.location === "string"
              ? vendor.location
              : String(vendor.location?.label ?? "Location pending"),
          price: Number(vendor.price ?? 0),
          rating: Number(vendor.rating ?? 0),
          responseTime: String(vendor.responseTime ?? "1 hour"),
          image: String(vendor.image || "/eventra_photos/photographer.jpg"),
          description: String(vendor.description ?? "Professional event vendor"),
          services: Array.isArray(vendor.servicesOffered)
            ? vendor.servicesOffered.map((item: unknown) => String(item))
            : Array.isArray(vendor.services)
              ? vendor.services.map((item: unknown) => String(item))
              : [],
          portfolio: Array.isArray(vendor.portfolio)
            ? vendor.portfolio.map((item: { url?: string } | string) =>
                typeof item === "string" ? item : String(item?.url ?? ""),
              )
            : [],
        })) satisfies Vendor[]

        setMatchingVendors(normalized)
      } catch (error) {
        setVendorError(error instanceof Error ? error.message : "Could not load vendor suggestions.")
      } finally {
        setVendorsLoading(false)
      }
    }

    void fetchMatchingVendors()
  }, [event?.id, event?.services])

  const addService = async (serviceName: string) => {
    if (!event) return

    const normalizedName = serviceName.trim()
    if (!normalizedName) return

    if (event.services.includes(normalizedName)) {
      showToast("This service is already in your plan.", "info")
      return
    }

    setPageError(null)
    setUpdatingService(true)

    try {
      if (!event.id) {
        throw new Error("Event ID is missing")
      }
      await addServiceToEvent(event.id, normalizedName)
      setShowServiceModal(false)
      setServiceQuery("")
      showToast(`${normalizedName} added to your event.`, "success")
    } catch {
      setPageError("We couldn't add that service right now.")
      showToast("Failed to add service.", "error")
    } finally {
      setUpdatingService(false)
    }
  }

  if (isLoading) {
    return <PageCardSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load this event."
        description="Retry to refresh event details, vendor requests, and payment progress."
        onRetry={() => void refreshData()}
        retryLabel="Retry"
      />
    )
  }

  if (!event) {
    return (
      <EmptyState
        title="Add your first event"
        description="This event could not be loaded. Return to your events list or create a new plan."
        actionLabel="Create Event"
        actionHref="/customer/events/create"
      />
    )
  }

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-white">
            <div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                {event.type || "Custom Event"}
              </span>
              <h1 className="mt-4 text-4xl font-bold">{event.name}</h1>
              <p className="mt-3 text-sm text-white/85">
                {formatDisplayDate(event.date)} • {event.location || "Location TBD"} •{" "}
                {event.guests > 0 ? `${event.guests} guests` : "Guest estimate pending"}
              </p>
            </div>
            <div className="rounded-3xl bg-white/14 px-5 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/75">Planning Progress</p>
              <p className="mt-2 text-3xl font-bold">{progress}%</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.42fr]">
          <div>
            <p className="theme-muted max-w-2xl text-base">
              {event.notes || "Keep your event moving by adding services, sending vendor requests, and completing bookings."}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowServiceModal(true)}
                disabled={updatingService}
                className="theme-button rounded-full px-5 py-2 text-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingService ? "Adding Service..." : "Add Service"}
              </button>
              <Link
                href="/customer/vendors"
                className="rounded-full border border-[#EAD7CF] px-5 py-2 text-sm font-medium text-[#6A554C] transition hover:bg-[#FFF5F0]"
              >
                Explore All Vendors
              </Link>
            </div>

            {pageError ? <p className="mt-3 text-sm text-red-500">{pageError}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {event.services.length > 0 ? (
                event.services.map((service) => (
                  <Link
                    key={service}
                    href={`/customer/vendors?service=${encodeURIComponent(service)}`}
                    className="theme-surface rounded-full px-4 py-2 text-sm transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                  >
                    {service}
                  </Link>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-[#EAD7CF] bg-[#FFF9F6] px-5 py-4 text-sm text-[#7A6A63]">
                  Add your first service to unlock vendor matches and planning progress.
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="theme-surface rounded-3xl p-6">
                <h2 className="text-lg font-semibold">Checklist</h2>
                <ul className="theme-muted mt-4 space-y-3 text-sm">
                  {checklistItems.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="theme-surface rounded-3xl p-6">
                <h2 className="text-lg font-semibold">Active Vendor Flow</h2>
                <div className="mt-4 space-y-3">
                  {eventRequests.length === 0 ? (
                    <p className="theme-muted text-sm">
                      No vendor requests sent yet. Add a service and open vendor suggestions to start outreach.
                    </p>
                  ) : (
                    eventRequests.map((request) => {
                      const booking = eventBookings.find((item) => item.requestId === request.id)
                      return (
                        <div key={request.id} className="rounded-2xl bg-white/70 p-4">
                          <p className="font-medium">Vendor request #{request.id.slice(-5)}</p>
                          <p className="theme-muted mt-1 text-sm">
                            Status: {booking?.status ?? request.status}
                          </p>
                          <p className="theme-muted mt-1 text-xs">
                            Payment: {booking?.paymentStatus ?? "pending"}
                          </p>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="theme-surface rounded-3xl p-6">
              <p className="theme-muted text-sm">Progress Breakdown</p>
              <div className="mt-4">
                <EventProgress progress={progress} />
              </div>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="theme-muted">Services added</span>
                  <span>{event.services.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-muted">Vendor requests</span>
                  <span>{eventRequests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-muted">Accepted bookings</span>
                  <span>{acceptedBookings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-muted">Payments done</span>
                  <span>{paidBookings.length}</span>
                </div>
              </div>
            </div>

            <div className="theme-surface rounded-3xl p-6">
              <h2 className="text-lg font-semibold">Budget Snapshot</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="theme-muted">Planned budget</span>
                  <span>{formatCurrency(event.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="theme-muted">Booked amount</span>
                  <span>{formatCurrency(event.spent || 0)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Remaining budget</span>
                  <span>{formatCurrency(Math.max(event.budget - (event.spent || 0), 0))}</span>
                </div>
              </div>
            </div>

            <div className="theme-surface rounded-3xl p-6">
              <h2 className="text-lg font-semibold">Timeline</h2>
              <div className="mt-4 space-y-4">
                {dynamicTimeline.map((item) => (
                  <div key={item.title} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="theme-muted mt-1 text-sm">{item.label}</p>
                      <p className="theme-muted mt-1 text-sm">{item.detail}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.completed
                          ? "bg-[var(--primary-light)] text-[var(--primary)]"
                          : "bg-[#F6EFEA] text-[#6A554C]"
                      }`}
                    >
                      {item.completed ? "Done" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="theme-surface rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Matching Vendors</h2>
                {event.services.length > 0 ? (
                  <Link
                    href={`/customer/vendors?service=${encodeURIComponent(event.services[0])}`}
                    className="text-sm font-medium text-[var(--primary)]"
                  >
                    View all
                  </Link>
                ) : null}
              </div>
              <div className="mt-4 space-y-3">
                {!event.services.length ? (
                  <EmptyState
                    title="Add your first service"
                    description="Add services to this event to unlock matching vendor recommendations."
                    secondaryAction={
                      <button
                        type="button"
                        onClick={() => setShowServiceModal(true)}
                        className="rounded-full border px-5 py-2 text-sm font-medium"
                      >
                        Add Service
                      </button>
                    }
                  />
                ) : vendorsLoading ? (
                  <PageCardSkeleton count={2} className="md:grid-cols-1" />
                ) : vendorError ? (
                  <ErrorState
                    title="We couldn't load vendor matches."
                    description={vendorError}
                    onRetry={() => void refreshData()}
                    retryLabel="Retry"
                  />
                ) : matchingVendors.length === 0 ? (
                  <EmptyState
                    title="No vendors found"
                    description="No vendors found. Try another service or search the vendor directory."
                    actionLabel="Explore All Vendors"
                    actionHref="/customer/vendors"
                  />
                ) : (
                  matchingVendors.slice(0, 4).map((vendor) => (
                    <Link
                      key={vendor.id}
                      href={`/customer/vendors/${vendor.id}`}
                      className="block rounded-2xl bg-white/70 p-4 transition hover:shadow-lg"
                    >
                      <p className="font-medium">{vendor.name}</p>
                      <p className="theme-muted mt-1 text-sm">{vendor.category}</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="theme-primary font-medium">{formatCurrency(vendor.price)}</span>
                        <span className="theme-muted">{vendor.responseTime || "1 hour"}</span>
                      </div>
                    </Link>
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
            className="theme-card w-full max-w-2xl p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Add a Service</h3>
                <p className="theme-muted mt-1 text-sm">
                  Search the catalog, choose a suggestion, or add your own custom need.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowServiceModal(false)}
                className="theme-muted text-sm"
              >
                Close
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <input
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
                placeholder="Search for catering, photography, venue, mehendi..."
                className="input flex-1 p-3"
              />
              <button
                type="button"
                onClick={() => void addService(serviceQuery)}
                disabled={updatingService || !serviceQuery.trim()}
                className="rounded-full bg-[#E87D5F] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingService ? "Adding..." : "Add Custom"}
              </button>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-sm font-medium text-[#5F514B]">
                {serviceQuery ? "Matching suggestions" : "Popular suggestions"}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {serviceOptions.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => void addService(service)}
                    disabled={updatingService}
                    className="theme-surface rounded-2xl px-4 py-4 text-left transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="font-medium">{service}</span>
                  </button>
                ))}
              </div>

              {serviceOptions.length === 0 ? (
                <p className="theme-muted mt-4 text-sm">
                  No suggestions matched. Add &quot;{serviceQuery.trim() || "your service"}&quot; as a custom service to keep planning.
                </p>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  )
}
