"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { API_URL, apiFetch } from "@/app/lib/api"
import { useAuth } from "@/context/AuthContext"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)

const DEFAULT_VENDOR_IMAGE = "/eventra_photos/photographer.jpg"
const DEFAULT_EVENT_IMAGE = "/eventra_photos/event3.jpg"

export type Service = {
  _id: string
  name: string
  category: string
  price: number
  pricingModel?: string
  description?: string
  location: Record<string, any>
  image?: string
  vendor_Id: string
}

export type Vendor = {
  id: string
  userId: string
  name: string
  category: string
  location: string
  price: number
  rating: number
  responseTime: string
  image: string
  description: string
  services: string[]
  portfolio: string[]
}

export type EventItem = {
  id: string
  name: string
  type: string
  date: string
  location: string
  status: string
  guests: number
  budget: number
  spent: number
  coverImage: string
  notes: string
  checklist: string[]
  vendorIds: string[]
  timeline: Array<{
    title: string
    detail: string
  }>
  services: string[]
}

export type RequestRecord = {
  id: string
  eventId: string
  vendorId: string
  customerId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
  clientName: string
}

export type BookingRecord = {
  id: string
  requestId: string
  eventId: string
  vendorId: string
  customerId: string
  status: "pending" | "accepted" | "rejected" | "confirmed" | "completed" | "cancelled"
  amount: number
}

type CreateEventInput = {
  name: string
  date: string
  location: string
  budget: string
  type: string | null
  guests?: string
  services?: string[]
}

type EventContextValue = {
  vendors: Vendor[]
  events: EventItem[]
  requests: RequestRecord[]
  bookings: BookingRecord[]
  services: Service[]
  currentEvent: EventItem | null
  currentEventId: string | null
  isLoading: boolean
  selectedServices: string[]
  selectedVendors: Vendor[]
  totalPrice: number
  createEvent: (event: CreateEventInput) => Promise<EventItem | null>
  refreshData: () => Promise<void>
  setCurrentEventId: (eventId: string | null) => void
  addServiceToEvent: (eventId: string, service: string) => Promise<void>
  removeServiceFromEvent: (eventId: string, service: string) => Promise<void>
  sendVendorRequest: (eventId: string, vendorId: string) => Promise<RequestRecord | null>
  acceptRequest: (requestId: string) => Promise<void>
  declineRequest: (requestId: string) => Promise<void>
  getRequestForVendor: (eventId: string, vendorId: string) => RequestRecord | undefined
  getBookingForRequest: (requestId: string) => BookingRecord | undefined
  recommendedVendors: Vendor[]
  checkoutTotal: number
  checkoutSummary: Array<{
    requestId: string
    bookingId?: string
    vendorId: string
    vendorName: string
    category: string
    amount: number
    bookingStatus?: BookingRecord["status"]
  }>
  formatCurrency: (value: number) => string
}

const EventContext = createContext<EventContextValue | null>(null)

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

const buildLocationLabel = (location: unknown) => {
  if (typeof location === "string") return location
  if (!location || typeof location !== "object") return "Location pending"

  const values = Object.values(location as Record<string, unknown>)
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)

  return values[0] ?? "Location pending"
}

const resolveMediaUrl = (value: unknown) => {
  const path = String(value ?? "").trim()
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  if (path.startsWith("/")) return `${API_URL}${path}`
  return `${API_URL}/${path}`
}

const buildChecklist = (event: { services?: string[] }, hasAcceptedRequests: boolean, hasConfirmedBookings: boolean) => [
  event.services?.length ? "Services added" : "Add services",
  "Browse vendors",
  hasAcceptedRequests ? "Vendor accepted request" : "Wait for vendor approval",
  hasConfirmedBookings ? "Booking confirmed" : "Complete payment after approval",
]

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [requests, setRequests] = useState<RequestRecord[]>([])
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [currentEventId, setCurrentEventId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshData = async () => {
    if (!profile?.uid) {
      setVendors([])
      setEvents([])
      setRequests([])
      setBookings([])
      setServices([])
      setCurrentEventId(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const [vendorResponse, reviewResponse, serviceResponse] = await Promise.all([
        apiFetch("/vendors"),
        apiFetch("/reviews").catch(() => []),
        apiFetch("/services").catch(() => []),
      ])

      const vendorList = asArray<any>(vendorResponse)
      const reviews = asArray<any>(reviewResponse)
      const serviceList = asArray<any>(serviceResponse)

      const mappedVendors = vendorList.map((vendor) => {
        const vendorReviews = reviews.filter((review) => review.vendorId === String(vendor._id))
        const rating = vendorReviews.length
          ? vendorReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / vendorReviews.length
          : 0
        const portfolioFromItems = Array.isArray(vendor.portfolio)
          ? vendor.portfolio
              .map((item: { url?: string } | string) =>
                resolveMediaUrl(typeof item === "string" ? item : item?.url),
              )
              .filter(Boolean)
          : []
        const portfolioFromGallery = Array.isArray(vendor.gallery)
          ? vendor.gallery.map((item: string) => resolveMediaUrl(item)).filter(Boolean)
          : []
        const portfolio = Array.from(new Set([...portfolioFromItems, ...portfolioFromGallery]))
        const primaryImage = resolveMediaUrl(vendor.image) || portfolio[0] || DEFAULT_VENDOR_IMAGE

        return {
          id: String(vendor._id),
          userId: String(vendor.userId ?? ""),
          name: String(vendor.name ?? "Vendor"),
          category: String(vendor.category ?? vendor.businessType ?? "Vendor Service"),
          location: buildLocationLabel(vendor.location),
          price: Number(vendor.price ?? 0),
          rating,
          responseTime: String(vendor.responseTime ?? "1 hour"),
          image: primaryImage,
          description: String(vendor.description ?? vendor.businessType ?? "Professional event vendor"),
          services: Array.isArray(vendor.servicesOffered) && vendor.servicesOffered.length
            ? vendor.servicesOffered.map((item: unknown) => String(item))
            : [String(vendor.category ?? vendor.businessType ?? "Vendor Service")],
          portfolio,
        } satisfies Vendor
      })

      let activeVendorId: string | null = null
      if (profile.role === "vendor") {
        const ownVendor = vendorList.find((vendor) => String(vendor.userId) === profile.uid)
        activeVendorId = ownVendor ? String(ownVendor._id) : null
      }

      const [eventResponse, requestResponse, bookingResponse] = await Promise.all([
        profile.role === "customer"
          ? apiFetch(`/events?customerId=${profile.uid}`)
          : apiFetch("/events"),
        profile.role === "customer"
          ? apiFetch(`/requests?userId=${profile.uid}`)
          : activeVendorId
            ? apiFetch(`/requests?vendorId=${activeVendorId}`)
            : Promise.resolve([]),
        profile.role === "customer"
          ? apiFetch(`/bookings?customerId=${profile.uid}`)
          : activeVendorId
            ? apiFetch(`/bookings?vendorId=${activeVendorId}`)
            : Promise.resolve([]),
      ])

      const requestList = asArray<any>(requestResponse).map((request) => ({
        id: String(request._id),
        eventId: String(request.eventId),
        vendorId: String(request.vendorId),
        customerId: String(request.customerId),
        status: String(request.status) as RequestRecord["status"],
        createdAt: String(request.createdAt ?? ""),
        clientName: "",
      }))

      const bookingList = asArray<any>(bookingResponse).map((booking) => ({
        id: String(booking._id),
        requestId: String(booking.requestId),
        eventId: String(booking.eventId),
        vendorId: String(booking.vendorId),
        customerId: String(booking.customerId),
        status: String(booking.status) as BookingRecord["status"],
        amount: Number(booking.amount ?? 0),
      }))

      const rawEvents = asArray<any>(eventResponse)
      const mappedEvents = rawEvents.map((event) => {
        const eventRequests = requestList.filter((request) => request.eventId === String(event._id))
        const eventBookings = bookingList.filter((booking) => booking.eventId === String(event._id))
        const acceptedVendorIds = eventRequests
          .filter((request) => request.status === "accepted")
          .map((request) => request.vendorId)

        return {
          id: String(event._id),
          name: String(event.name ?? event.eventType ?? "Untitled Event"),
          type: String(event.eventType ?? "Custom"),
          date: String(event.eventDate ?? ""),
          location: buildLocationLabel(event.location),
          status: String(event.status ?? "draft"),
          guests: Number(event.guestCount ?? 0),
          budget: Number(event.budget ?? 0),
          spent: eventBookings.reduce((total, booking) => total + booking.amount, 0),
          coverImage: String(event.coverImage ?? DEFAULT_EVENT_IMAGE),
          notes: acceptedVendorIds.length
            ? "Track vendor responses, confirmed bookings, and payment status from this event."
            : "Create your event, send vendor requests, and wait for approval before payment.",
          checklist: buildChecklist(
            event,
            acceptedVendorIds.length > 0,
            eventBookings.some((booking) => booking.status === "confirmed")
          ),
          vendorIds: acceptedVendorIds,
          timeline: [
            { title: "Request", detail: "Send vendor requests from the discovery flow." },
            { title: "Approval", detail: "Wait for vendor acceptance before payment." },
            { title: "Booking", detail: "Complete payment to confirm the booking." },
          ],
          services: asArray<string>(event.services).map((service) => String(service)),
        } satisfies EventItem
      })

      const eventNameMap = new Map(mappedEvents.map((event) => [event.id, event.name]))
      setVendors(mappedVendors)
      setEvents(mappedEvents)
      setServices(serviceList)
      setRequests(
        requestList.map((request) => ({
          ...request,
          clientName: eventNameMap.get(request.eventId) ?? "Event request",
        }))
      )
      setBookings(bookingList)
      setCurrentEventId((current) => {
        if (current && mappedEvents.some((event) => event.id === current)) {
          return current
        }
        return mappedEvents[0]?.id ?? null
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refreshData()
  }, [profile?.uid, profile?.role])

  const currentEvent =
    events.find((event) => event.id === currentEventId) ?? events[0] ?? null

  const createEvent = async (event: CreateEventInput) => {
    if (!profile?.uid) return null

    const response = await apiFetch("/events", {
      method: "POST",
      body: JSON.stringify({
        customerId: profile.uid,
        name: event.name || `${event.type ?? "Custom"} Event`,
        eventType: event.type ?? "Custom",
        eventDate: event.date,
        location: { label: event.location || "Location pending" },
        status: "planning",
        budget: Number(event.budget || 0),
        guestCount: Number(event.guests || 0),
        services: event.services ?? [],
      }),
    })

    const createdId = String(response._id ?? response.id)
    await refreshData()
    setCurrentEventId(createdId)
    return {
      id: createdId,
      name: String(response.name ?? event.name ?? `${event.type ?? "Custom"} Event`),
      type: String(response.eventType ?? event.type ?? "Custom"),
      date: String(response.eventDate ?? event.date),
      location: buildLocationLabel(response.location ?? { label: event.location }),
      status: String(response.status ?? "planning"),
      guests: Number(response.guestCount ?? event.guests ?? 0),
      budget: Number(response.budget ?? event.budget ?? 0),
      spent: 0,
      coverImage: String(response.coverImage ?? DEFAULT_EVENT_IMAGE),
      notes: "Create your event, send vendor requests, and wait for approval before payment.",
      checklist: buildChecklist({ services: response.services }, false, false),
      vendorIds: [],
      timeline: [
        { title: "Request", detail: "Send vendor requests from the discovery flow." },
        { title: "Approval", detail: "Wait for vendor acceptance before payment." },
        { title: "Booking", detail: "Complete payment to confirm the booking." },
      ],
      services: asArray<string>(response.services).map((service) => String(service)),
    }
  }

  const updateEventServices = async (eventId: string, nextServices: string[]) => {
    await apiFetch(`/events/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify({ services: nextServices }),
    })
    await refreshData()
  }

  const addServiceToEvent = async (eventId: string, service: string) => {
    const targetEvent = events.find((event) => event.id === eventId)
    if (!targetEvent || targetEvent.services.includes(service)) return
    await updateEventServices(eventId, [...targetEvent.services, service])
  }

  const removeServiceFromEvent = async (eventId: string, service: string) => {
    const targetEvent = events.find((event) => event.id === eventId)
    if (!targetEvent) return
    await updateEventServices(
      eventId,
      targetEvent.services.filter((item) => item !== service)
    )
  }

  const sendVendorRequest = async (eventId: string, vendorId: string) => {
    if (!profile?.uid || profile.role !== "customer") return null

    const existing = requests.find(
      (request) => request.eventId === eventId && request.vendorId === vendorId
    )
    if (existing) return existing

    const response = await apiFetch("/requests", {
      method: "POST",
      body: JSON.stringify({
        customerId: profile.uid,
        vendorId,
        eventId,
      }),
    })

    const requestId = String(response._id ?? response.id)
    await refreshData()
    return {
      id: requestId,
      eventId,
      vendorId,
      customerId: profile.uid,
      status: "pending" as const,
      createdAt: String(response.createdAt ?? new Date().toISOString()),
      clientName: events.find((item) => item.id === eventId)?.name ?? "Event request",
    }
  }

  const acceptRequest = async (requestId: string) => {
    if (!profile?.uid) return
    await apiFetch(`/requests/${requestId}/accept`, {
      method: "PATCH",
      body: JSON.stringify({ actorUserId: profile.uid }),
    })
    await refreshData()
  }

  const declineRequest = async (requestId: string) => {
    if (!profile?.uid) return
    await apiFetch(`/requests/${requestId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ actorUserId: profile.uid }),
    })
    await refreshData()
  }

  const getRequestForVendor = (eventId: string, vendorId: string) =>
    requests.find(
      (request) => request.eventId === eventId && request.vendorId === vendorId
    )

  const getBookingForRequest = (requestId: string) =>
    bookings.find((booking) => booking.requestId === requestId)

  const recommendedVendors = useMemo(() => {
    if (!currentEvent) return vendors.slice(0, 3)

    const filtered = vendors.filter((vendor) =>
      currentEvent.services.some((service) =>
        vendor.category.toLowerCase().includes(service.toLowerCase()) ||
        service.toLowerCase().includes(vendor.category.toLowerCase())
      )
    )

    return filtered.slice(0, 3)
  }, [currentEvent, vendors])

  const selectedServices = currentEvent?.services ?? []

  const selectedVendors = useMemo(
    () =>
      currentEvent
        ? vendors.filter((vendor) => currentEvent.vendorIds.includes(vendor.id))
        : [],
    [currentEvent, vendors]
  )

  const checkoutSummary = useMemo(() => {
    if (!currentEvent) return []

    return requests
      .filter(
        (request) =>
          request.eventId === currentEvent.id && request.status === "accepted"
      )
      .map((request) => {
        const vendor = vendors.find((item) => item.id === request.vendorId)
        const booking = bookings.find((item) => item.requestId === request.id)

        return {
          requestId: request.id,
          bookingId: booking?.id,
          vendorId: request.vendorId,
          vendorName: vendor?.name ?? "Vendor",
          category: vendor?.category ?? "Vendor Service",
          amount: booking?.amount ?? vendor?.price ?? 0,
          bookingStatus: booking?.status,
        }
      })
  }, [bookings, currentEvent, requests, vendors])

  const checkoutTotal = checkoutSummary.reduce(
    (total, item) => total + item.amount,
    0
  )

  const totalPrice = checkoutTotal

  return (
    <EventContext.Provider
      value={{
        vendors,
        events,
        requests,
        bookings,
        services,
        currentEvent,
        currentEventId,
        isLoading,
        selectedServices,
        selectedVendors,
        totalPrice,
        createEvent,
        refreshData,
        setCurrentEventId,
        addServiceToEvent,
        removeServiceFromEvent,
        sendVendorRequest,
        acceptRequest,
        declineRequest,
        getRequestForVendor,
        getBookingForRequest,
        recommendedVendors,
        checkoutTotal,
        checkoutSummary,
        formatCurrency,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export const useEvent = () => {
  const context = useContext(EventContext)

  if (!context) {
    throw new Error("useEvent must be used within an EventProvider")
  }

  return context
}
