"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"
import {
  customerEvents,
  customerVendors,
  formatCurrency,
} from "@/app/(customer)/mockData"

export type Vendor = (typeof customerVendors)[number]

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
  status: "pending" | "accepted" | "declined"
  createdAt: string
  clientName: string
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
  currentEvent: EventItem | null
  currentEventId: string | null
  selectedServices: string[]
  selectedVendors: Vendor[]
  totalPrice: number
  createEvent: (event: CreateEventInput) => void
  setCurrentEventId: (eventId: string) => void
  addServiceToEvent: (eventId: string, service: string) => void
  removeServiceFromEvent: (eventId: string, service: string) => void
  addVendorToEvent: (eventId: string, vendorId: string) => void
  sendVendorRequest: (eventId: string, vendorId: string) => void
  acceptRequest: (requestId: string) => void
  declineRequest: (requestId: string) => void
  getRequestForVendor: (eventId: string, vendorId: string) => RequestRecord | undefined
  recommendedVendors: Vendor[]
  checkoutTotal: number
  checkoutSummary: Array<{
    requestId: string
    vendorId: string
    vendorName: string
    category: string
    amount: number
  }>
  formatCurrency: (value: number) => string
}

const initialEvents: EventItem[] = customerEvents.map((event) => {
  const vendorIds = event.vendorIds
  const services = customerVendors
    .filter((vendor) => vendorIds.includes(vendor.id))
    .map((vendor) => vendor.category)

  return {
    ...event,
    services,
  }
})

const initialRequests: RequestRecord[] = initialEvents[0]
  ? initialEvents[0].vendorIds.map((vendorId, index) => ({
      id: `req-${vendorId}-${index + 1}`,
      eventId: initialEvents[0].id,
      vendorId,
      status: index < 2 ? "accepted" : "pending",
      createdAt: index === 0 ? "2h ago" : "15m ago",
      clientName: "Aanya & Rohan Mehta",
    }))
  : []

const EventContext = createContext<EventContextValue | null>(null)
const EVENT_STORAGE_KEY = "eventra.events.state"

const getStoredEventState = () => {
  if (typeof window === "undefined") {
    return {
      events: initialEvents,
      requests: initialRequests,
      currentEventId: initialEvents[0]?.id ?? null,
    }
  }

  const rawState = window.localStorage.getItem(EVENT_STORAGE_KEY)
  if (!rawState) {
    return {
      events: initialEvents,
      requests: initialRequests,
      currentEventId: initialEvents[0]?.id ?? null,
    }
  }

  try {
    const parsedState = JSON.parse(rawState) as {
      events?: EventItem[]
      requests?: RequestRecord[]
      currentEventId?: string | null
    }

    return {
      events: parsedState.events?.length ? parsedState.events : initialEvents,
      requests: parsedState.requests?.length ? parsedState.requests : initialRequests,
      currentEventId: parsedState.currentEventId ?? initialEvents[0]?.id ?? null,
    }
  } catch {
    window.localStorage.removeItem(EVENT_STORAGE_KEY)

    return {
      events: initialEvents,
      requests: initialRequests,
      currentEventId: initialEvents[0]?.id ?? null,
    }
  }
}

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const storedState = getStoredEventState()
  const [vendors] = useState<Vendor[]>(customerVendors)
  const [events, setEvents] = useState<EventItem[]>(storedState.events)
  const [requests, setRequests] = useState<RequestRecord[]>(storedState.requests)
  const [currentEventId, setCurrentEventId] = useState<string | null>(
    storedState.currentEventId
  )

  useEffect(() => {
    if (typeof window === "undefined") return

    window.localStorage.setItem(
      EVENT_STORAGE_KEY,
      JSON.stringify({
        events,
        requests,
        currentEventId,
      })
    )
  }, [events, requests, currentEventId])

  const currentEvent =
    events.find((event) => event.id === currentEventId) ?? events[0] ?? null

  const addVendorToEvent = (eventId: string, vendorId: string) => {
    const vendor = vendors.find((item) => item.id === vendorId)
    if (!vendor) return

    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              vendorIds: event.vendorIds.includes(vendor.id)
                ? event.vendorIds
                : [...event.vendorIds, vendor.id],
              services: event.services.includes(vendor.category)
                ? event.services
                : [...event.services, vendor.category],
              spent: event.vendorIds.includes(vendor.id)
                ? event.spent
                : event.spent + vendor.price,
            }
          : event
      )
    )
  }

  const createEvent = (event: CreateEventInput) => {
    const nextEvent: EventItem = {
      id: `${Date.now()}`,
      name: event.name || `${event.type ?? "Custom"} Event`,
      type: event.type ?? "Custom",
      date: event.date || "Date pending",
      location: event.location || "Location pending",
      status: "Planning",
      guests: Number(event.guests || 0),
      budget: Number(event.budget || 0),
      spent: 0,
      coverImage: "/eventra_photos/event3.jpg",
      notes:
        "This event was just created. Add services, send vendor requests, and unlock planning tasks.",
      checklist: [
        "Define guest flow",
        "Add required services",
        "Send vendor requests",
        "Review initial budget",
      ],
      vendorIds: [],
      timeline: [
        { title: "6 Months Before", detail: "Book Venue" },
        { title: "4 Months Before", detail: "Photographer" },
        { title: "3 Months Before", detail: "Catering" },
      ],
      services: event.services ?? [],
    }

    setEvents((current) => [nextEvent, ...current])
    setCurrentEventId(nextEvent.id)
  }

  const addServiceToEvent = (eventId: string, service: string) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId && !event.services.includes(service)
          ? { ...event, services: [...event.services, service] }
          : event
      )
    )
  }

  const removeServiceFromEvent = (eventId: string, service: string) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              services: event.services.filter((item) => item !== service),
            }
          : event
      )
    )
  }

  const sendVendorRequest = (eventId: string, vendorId: string) => {
    const existing = requests.find(
      (request) => request.eventId === eventId && request.vendorId === vendorId
    )

    addVendorToEvent(eventId, vendorId)
    if (existing) return

    const nextRequest: RequestRecord = {
      id: `req-${vendorId}-${Date.now()}`,
      eventId,
      vendorId,
      status: "pending",
      createdAt: "Just now",
      clientName:
        events.find((event) => event.id === eventId)?.name ?? "New Client",
    }

    setRequests((current) => [nextRequest, ...current])
  }

  const acceptRequest = (requestId: string) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId ? { ...request, status: "accepted" } : request
      )
    )

    const request = requests.find((item) => item.id === requestId)
    if (!request) return

    const vendor = vendors.find((item) => item.id === request.vendorId)
    if (!vendor) return

    setEvents((current) =>
      current.map((event) =>
        event.id === request.eventId
          ? {
              ...event,
              vendorIds: event.vendorIds.includes(vendor.id)
                ? event.vendorIds
                : [...event.vendorIds, vendor.id],
              services: event.services.includes(vendor.category)
                ? event.services
                : [...event.services, vendor.category],
              spent: event.vendorIds.includes(vendor.id)
                ? event.spent
                : event.spent + vendor.price,
            }
          : event
      )
    )
  }

  const declineRequest = (requestId: string) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId ? { ...request, status: "declined" } : request
      )
    )
  }

  const getRequestForVendor = (eventId: string, vendorId: string) =>
    requests.find(
      (request) => request.eventId === eventId && request.vendorId === vendorId
    )

  const recommendedVendors = useMemo(() => {
    if (!currentEvent) return vendors.slice(0, 3)

    return vendors
      .filter((vendor) =>
        currentEvent.services.some((service) =>
          vendor.category.toLowerCase().includes(service.toLowerCase()) ||
          service.toLowerCase().includes(vendor.category.toLowerCase())
        )
      )
      .slice(0, 3)
  }, [currentEvent, vendors])

  const selectedServices = currentEvent?.services ?? []

  const selectedVendors = useMemo(
    () =>
      currentEvent
        ? vendors.filter((vendor) => currentEvent.vendorIds.includes(vendor.id))
        : [],
    [currentEvent, vendors]
  )

  const checkoutSummary = useMemo(
    () =>
      selectedVendors.map((vendor) => {
        const request = requests.find(
          (item) =>
            item.eventId === currentEvent?.id && item.vendorId === vendor.id
        )

        return {
          requestId: request?.id ?? `selected-${vendor.id}`,
          vendorId: vendor.id,
          vendorName: vendor.name,
          category: vendor.category,
          amount: vendor.price,
        }
      }),
    [currentEvent?.id, requests, selectedVendors]
  )

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
        currentEvent,
        currentEventId,
        selectedServices,
        selectedVendors,
        totalPrice,
        createEvent,
        setCurrentEventId,
        addServiceToEvent,
        removeServiceFromEvent,
        addVendorToEvent,
        sendVendorRequest,
        acceptRequest,
        declineRequest,
        getRequestForVendor,
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
