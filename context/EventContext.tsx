"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { API_URL, apiFetch } from "@/app/lib/api"
import { onBookingStatusUpdated, onNotificationCreated, offAll, getSocket } from "@/app/lib/socket"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import type { Booking, Request, Vendor, Notification } from "@/app/types/eventra"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)

const DEFAULT_VENDOR_IMAGE = "/eventra_photos/profile.png"
const DEFAULT_EVENT_IMAGE = "/eventra_photos/event5.jpg"

export type Service = {
  _id: string
  name: string
  category: string
  price: number
  pricingModel?: string
  description?: string
  location: Record<string, string>
  image?: string
  vendor_Id: string
}

// core vendor type comes from shared types
export type VendorType = Vendor

export type EventItem = {
  id?: string
  _id?: string
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

export type RequestRecord = Request

export type BookingRecord = Booking

type BookingRealtimeUpdate = Partial<BookingRecord> & {
  vendorUserId?: string
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
    paymentStatus?: BookingRecord["paymentStatus"]
  }>
  formatCurrency: (value: number) => string
  error: string | null
}

const EventContext = createContext<EventContextValue | null>(null)

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])
const unwrapData = <T,>(value: unknown): T[] => {
  const payload = (value as { data?: unknown } | null)?.data ?? value
  return asArray<T>(payload)
}

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

const getEntityId = (value: unknown, fallback = "") => {
  if (!value || typeof value !== "object") return fallback
  const record = value as Record<string, unknown>
  return String(record._id ?? record.id ?? fallback)
}

const dedupeById = <T extends Record<string, unknown>>(items: T[], getId: (item: T) => string) => {
  const map = new Map<string, T>()
  items.forEach((item) => {
    const id = getId(item)
    if (id) {
      map.set(id, item)
    }
  })
  return Array.from(map.values())
}

const normalizeVendor = (vendor: Record<string, unknown>, reviews: Array<Record<string, unknown>>) => {
  const vendorId = getEntityId(vendor)
  const vendorReviews = reviews.filter((review) => String(review.vendorId ?? "") === vendorId)
  const rating = vendorReviews.length
    ? vendorReviews.reduce((sum, review) => sum + Number(review.rating ?? 0), 0) / vendorReviews.length
    : Number(vendor.rating ?? 0)
  const categories = Array.isArray(vendor.category)
    ? (vendor.category as unknown[])
        .map((item) => String(item))
        .filter(Boolean)
    : [String(vendor.category ?? vendor.businessType ?? "Vendor Service")].filter(Boolean)
  const portfolioFromItems = Array.isArray(vendor.portfolio)
    ? (vendor.portfolio as Array<string | { url?: string }>)
        .map((item) =>
          resolveMediaUrl(typeof item === "string" ? item : item?.url),
        )
        .filter(Boolean)
    : []
  const portfolioFromGallery = Array.isArray(vendor.gallery)
    ? (vendor.gallery as string[])
        .map((item) => resolveMediaUrl(item))
        .filter(Boolean)
    : []
  const portfolio = Array.from(new Set([...portfolioFromItems, ...portfolioFromGallery]))
  const primaryImage = resolveMediaUrl(vendor.profileImage) || resolveMediaUrl(vendor.image) || portfolio[0] || DEFAULT_VENDOR_IMAGE

  const id = String(getEntityId(vendor));

  return {
    _id: id,
    id: id,
    userId: String(vendor.userId ?? ""),
    name: String(vendor.name ?? vendor.businessName ?? "Vendor"),
    category: categories[0] ?? "Vendor Service",
    location: buildLocationLabel(vendor.location),
    price: Number(vendor.price ?? 0),
    rating,
    responseTime: String(vendor.responseTime ?? "1 hour"),
    image: primaryImage,
    description: String(vendor.description ?? vendor.businessType ?? "Professional event vendor"),
    services: Array.isArray(vendor.servicesOffered) && (vendor.servicesOffered as unknown[]).length
      ? (vendor.servicesOffered as unknown[]).map((item) => String(item))
      : categories.length
        ? categories
        : ["Vendor Service"],
    portfolio,
  } satisfies Vendor
}

const normalizeBooking = (booking: Record<string, unknown>) => ({
  id: getEntityId(booking),
  requestId: String(booking.requestId ?? ""),
  eventId: String(booking.eventId ?? ""),
  vendorId: String(booking.vendorId ?? ""),
  vendorUserId: booking.vendorUserId ? String(booking.vendorUserId) : undefined,
  customerId: String(booking.customerId ?? ""),
  status: String(booking.status ?? "pending") as BookingRecord["status"],
  amount: Number(booking.amount ?? booking.price ?? 0),
  paymentStatus: booking.paymentStatus
    ? (String(booking.paymentStatus) as BookingRecord["paymentStatus"])
    : undefined,
} satisfies BookingRecord)

const normalizeRequest = (
  request: Record<string, unknown>,
  eventNameMap: Map<string, string>,
) => ({
  id: getEntityId(request),
  eventId: String(request.eventId ?? getEntityId(request.event) ?? ""),
  vendorId: String(request.vendorId ?? ""),
  customerId: String(request.customerId ?? ""),
  status: String(request.status ?? "pending") as RequestRecord["status"],
  createdAt: String(request.createdAt ?? ""),
  clientName: String(
    (request.customer as any)?.name ??
      eventNameMap.get(String(request.eventId ?? getEntityId(request.event) ?? "")) ??
      "Event request",
  ),
} satisfies RequestRecord)

const normalizeEvent = (
  event: Record<string, unknown>,
  requestList: RequestRecord[],
  bookingList: BookingRecord[],
) => {
  const eventId = getEntityId(event)
  const eventRequests = requestList.filter((request) => request.eventId === eventId)
  const eventBookings = bookingList.filter((booking) => booking.eventId === eventId)
  const acceptedVendorIds = eventRequests
    .filter((request) => request.status === "accepted")
    .map((request) => request.vendorId)

  return {
    id: eventId,
    name: String(event.name ?? event.eventType ?? "Untitled Event"),
    type: String(event.eventType ?? "Custom"),
    date: String(event.eventDate ?? event.date ?? ""),
    location: buildLocationLabel(event.location),
    status: String(event.status ?? "draft"),
    guests: Number(event.guestCount ?? event.guests ?? 0),
    budget: Number(event.budget ?? 0),
    spent: eventBookings.reduce((total, booking) => total + booking.amount, 0),
    coverImage: String(event.coverImage ?? DEFAULT_EVENT_IMAGE),
    notes: acceptedVendorIds.length
      ? "Track vendor responses, confirmed bookings, and payment status from this event."
      : "Create your event, send vendor requests, and wait for approval before payment.",
    checklist: buildChecklist(
      event,
      acceptedVendorIds.length > 0,
      eventBookings.some(
        (booking) =>
          booking.status === "confirmed" || booking.paymentStatus === "paid"
      )
    ),
    vendorIds: acceptedVendorIds,
    timeline: [
      { title: "Request", detail: "Send vendor requests from the discovery flow." },
      { title: "Approval", detail: "Wait for vendor acceptance before payment." },
      { title: "Booking", detail: "Complete payment to confirm the booking." },
    ],
    services: asArray<string>(event.services).map((service) => String(service)),
  } satisfies EventItem
}

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth()
  const { showToast } = useToast()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [requests, setRequests] = useState<RequestRecord[]>([])
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [currentEventId, setCurrentEventId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshData = useCallback(async () => {
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
    setError(null)

    try {
      const shouldLoadReviews = profile.role !== "admin"
      const shouldLoadServices = profile.role === "customer"

      const [vendorResponse, reviewResponse, serviceResponse] = await Promise.all([
        apiFetch("/vendors"),
        shouldLoadReviews ? apiFetch("/reviews").catch(() => []) : Promise.resolve([]),
        shouldLoadServices ? apiFetch("/services").catch(() => []) : Promise.resolve([]),
      ])

      const rawVendorList = unwrapData<Record<string, unknown>>(vendorResponse)
      const reviews = unwrapData<Record<string, unknown>>(reviewResponse)
      const serviceList = unwrapData<Service>(serviceResponse)
      const mappedVendors = rawVendorList.map((vendor) => normalizeVendor(vendor, reviews))

      const [rawEventsResponse, rawRequestsResponse, rawBookingsResponse] =
        profile.role === "customer"
          ? await Promise.all([
              apiFetch(`/events?customerId=${profile.uid}`),
              apiFetch(`/requests?userId=${profile.uid}`),
              apiFetch(`/bookings?customerId=${profile.uid}`),
            ])
          : profile.role === "vendor"
            ? await Promise.all([
                Promise.resolve([]),
                apiFetch(`/requests`).catch(() => []),
                apiFetch(`/bookings`).catch(() => []),
              ])
            : [[], [], []]

      const rawRequests = unwrapData<Record<string, unknown>>(rawRequestsResponse)
      const nestedRawEvents =
        profile.role === "vendor"
          ? (rawRequests
              .map((request) => request.event as unknown)
              .filter(Boolean) as Record<string, unknown>[])
          : []
      const rawEvents = dedupeById(
        [...unwrapData<Record<string, unknown>>(rawEventsResponse), ...nestedRawEvents],
        (event) => getEntityId(event),
      )
      const eventNameMap = new Map(
        rawEvents.map((event) => [
          String(event._id ?? event.id ?? event.eventId ?? ""),
          String(event.name ?? event.eventType ?? "Untitled Event"),
        ]),
      )
      const bookingSources = dedupeById(
        [
          ...unwrapData<Record<string, unknown>>(rawBookingsResponse),
          ...rawRequests
            .map((request) => request.booking as unknown)
            .filter(Boolean) as Record<string, unknown>[],
        ],
        (booking) => getEntityId(booking),
      )
      const bookingList = bookingSources.map(normalizeBooking)
      const requestList = rawRequests.map((request) => normalizeRequest(request, eventNameMap))
      const mappedEvents = rawEvents.map((event) => normalizeEvent(event, requestList, bookingList))

      setVendors(mappedVendors)
      setEvents(mappedEvents)
      setServices(serviceList)
      setRequests(requestList)
      setBookings(bookingList)
      setCurrentEventId((current) => {
        if (current && mappedEvents.some((event) => event.id === current)) {
          return current
        }
        return mappedEvents[0]?.id ?? null
      })
    } catch {
      setError("We couldn't load the latest event data.")
      setVendors([])
      setEvents([])
      setRequests([])
      setBookings([])
      setServices([])
      setCurrentEventId(null)
      showToast("We couldn't load your latest event data.", "error")
    } finally {
      setIsLoading(false)
    }
  }, [profile?.uid, profile?.role, showToast])

  const profileRef = useRef(profile)
  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  const callbackRef = useRef({ refreshData, showToast })
  useEffect(() => {
    callbackRef.current = { refreshData, showToast }
  }, [refreshData, showToast])

  useEffect(() => {
    const socket = getSocket()

    const handleBookingUpdate = (bookingUpdate: BookingRealtimeUpdate) => {
      const currentProfile = profileRef.current
      if (
        bookingUpdate.customerId === currentProfile?.uid ||
        bookingUpdate.vendorUserId === currentProfile?.uid
      ) {
        callbackRef.current.showToast(
          `Booking status changed: ${bookingUpdate.status}`,
          "success"
        )
      }
      void callbackRef.current.refreshData()
    }

    const handleNotification = (notification: Notification) => {
      if (!notification) return
      callbackRef.current.showToast(`Notification: ${notification.message}`, "info")
      void callbackRef.current.refreshData()
    }

    onBookingStatusUpdated(handleBookingUpdate)
    onNotificationCreated(handleNotification)

    return () => {
      offAll()
      // Don't disconnect socket as it may be used by other components
    }
  }, [])

  useEffect(() => {
    void refreshData()
  }, [profile?.uid, profile?.role, refreshData]);

  const currentEvent =
    events.find((event) => event.id === currentEventId) ?? events[0] ?? null

  const createEvent = async (event: CreateEventInput) => {
    if (!profile?.uid) return null

    const response = await apiFetch("/events", {
      method: "POST",
      body: JSON.stringify({
        name: event.name || `${event.type ?? "Custom"} Event`,
        eventType: event.type ?? "Custom",
        date: event.date,
        eventDate: event.date,
        location: { label: event.location || "Location pending" },
        status: "planning",
        budget: Number(event.budget || 0),
        guestCount: Number(event.guests || 0),
        services: event.services ?? [],
      }),
    })
    if (!(response as any)?._id && !(response as any)?.id) {
      throw new Error("Failed to create event")
    }

    const normalizedEvent = normalizeEvent(response as Record<string, unknown>, [], [])
    const createdId = normalizedEvent.id
    await refreshData()
    setCurrentEventId(createdId)
    return normalizedEvent
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
    if (!(response as any)?._id && !(response as any)?.id) {
      throw new Error("Failed to create request")
    }

    const requestId = getEntityId(response)
    await refreshData()
    showToast("Request sent", "success")
    return {
      id: requestId,
      eventId,
      vendorId,
      customerId: profile.uid,
      status: "pending" as const,
      createdAt: String((response as any).createdAt ?? new Date().toISOString()),
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
        const vendor = vendors.find((item) => item.id === String(request.vendorId))
        const booking = bookings.find((item) => item.requestId === request.id)

        return {
          requestId: request.id,
          bookingId: booking?.id,
          vendorId: request.vendorId,
          vendorName: vendor?.name ?? "Vendor",
          category: vendor?.category ?? "Vendor Service",
          amount: booking?.amount ?? vendor?.price ?? 0,
          bookingStatus: booking?.status,
          paymentStatus: booking?.paymentStatus,
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
      error,
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
