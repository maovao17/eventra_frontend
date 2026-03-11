"use client"

import {
  createContext,
  useContext,
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

export type ChatMessage = {
  id: string
  threadId: string
  sender: "customer" | "vendor"
  text: string
  timestamp: string
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
  createEvent: (event: CreateEventInput) => void
  setCurrentEventId: (eventId: string) => void
  addServiceToEvent: (eventId: string, service: string) => void
  removeServiceFromEvent: (eventId: string, service: string) => void
  sendVendorRequest: (eventId: string, vendorId: string) => void
  acceptRequest: (requestId: string) => void
  declineRequest: (requestId: string) => void
  getRequestForVendor: (eventId: string, vendorId: string) => RequestRecord | undefined
  getChatThreadId: (requestId: string) => string
  getMessagesForRequest: (requestId: string) => ChatMessage[]
  sendMessage: (requestId: string, sender: "customer" | "vendor", text: string) => void
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

const initialMessages: ChatMessage[] = [
  {
    id: "msg-1",
    threadId: "thread-req-1-1",
    sender: "vendor",
    text: "We can hold your date for 48 hours while you review the quote.",
    timestamp: "10:10 AM",
  },
  {
    id: "msg-2",
    threadId: "thread-req-1-1",
    sender: "customer",
    text: "Perfect. Please include candid coverage in the final package.",
    timestamp: "10:12 AM",
  },
  {
    id: "msg-3",
    threadId: "thread-req-2-2",
    sender: "customer",
    text: "Can you share a sample tasting menu for 220 guests?",
    timestamp: "11:05 AM",
  },
  {
    id: "msg-4",
    threadId: "thread-req-2-2",
    sender: "vendor",
    text: "Absolutely. I can send the curated menu and pricing slabs in the next hour.",
    timestamp: "11:12 AM",
  },
]

const EventContext = createContext<EventContextValue | null>(null)

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [vendors] = useState<Vendor[]>(customerVendors)
  const [events, setEvents] = useState<EventItem[]>(initialEvents)
  const [requests, setRequests] = useState<RequestRecord[]>(initialRequests)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [currentEventId, setCurrentEventId] = useState<string | null>(
    initialEvents[0]?.id ?? null
  )

  const currentEvent =
    events.find((event) => event.id === currentEventId) ?? events[0] ?? null

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

  const getChatThreadId = (requestId: string) => `thread-${requestId}`

  const getMessagesForRequest = (requestId: string) =>
    messages.filter((message) => message.threadId === getChatThreadId(requestId))

  const sendMessage = (
    requestId: string,
    sender: "customer" | "vendor",
    text: string
  ) => {
    if (!text.trim()) return

    setMessages((current) => [
      ...current,
      {
        id: `msg-${Date.now()}`,
        threadId: getChatThreadId(requestId),
        sender,
        text: text.trim(),
        timestamp: new Intl.DateTimeFormat("en-IN", {
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
      },
    ])
  }

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

  const checkoutSummary = useMemo(
    () =>
      requests
        .filter((request) => request.status === "accepted")
        .map((request) => {
          const vendor = vendors.find((item) => item.id === request.vendorId)
          return vendor
            ? {
                requestId: request.id,
                vendorId: vendor.id,
                vendorName: vendor.name,
                category: vendor.category,
                amount: vendor.price,
              }
            : null
        })
        .filter(Boolean) as Array<{
        requestId: string
        vendorId: string
        vendorName: string
        category: string
        amount: number
      }>,
    [requests, vendors]
  )

  const checkoutTotal = checkoutSummary.reduce(
    (total, item) => total + item.amount,
    0
  )

  return (
    <EventContext.Provider
      value={{
        vendors,
        events,
        requests,
        currentEvent,
        currentEventId,
        createEvent,
        setCurrentEventId,
        addServiceToEvent,
        removeServiceFromEvent,
        sendVendorRequest,
        acceptRequest,
        declineRequest,
        getRequestForVendor,
        getChatThreadId,
        getMessagesForRequest,
        sendMessage,
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
