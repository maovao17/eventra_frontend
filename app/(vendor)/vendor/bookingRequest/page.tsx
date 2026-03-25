"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import BookingCard from "@/components/vendor/BookingCard"
import FilterBar from "@/components/vendor/FilterBar"
import { apiFetch } from "@/app/lib/api"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"

type BookingStatus = "pending" | "accepted" | "declined"

type VendorRequest = {
  _id: string
  status: "pending" | "accepted" | "rejected"
  customerId: string
  eventId: string
  event?: {
    name?: string
    eventType?: string
    eventDate?: string
    location?: { label?: string }
    guestCount?: number
  }
  customer?: {
    name?: string
  }
  booking?: {
    _id?: string
    amount?: number
  }
}

type BookingCardItem = {
  requestId: string
  bookingId?: string
  name: string
  event: string
  date: string
  location: string
  guests: number
  price: string
  avatar: string
  status: BookingStatus
}

export default function BookingRequests() {
  const router = useRouter()
  const { profile } = useAuth()
  const { showToast } = useToast()

  const [requests, setRequests] = useState<VendorRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadRequests = async () => {
    if (!profile?.uid) return

    setIsLoading(true)
    setError("")

    const response = await apiFetch(`/requests/vendor`)
    if (response?.error) {
      setError(response.message || "Failed to load booking requests")
      setIsLoading(false)
      return
    }

    setRequests(Array.isArray(response) ? response : [])
    setIsLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRequests()
    }, 0)
    return () => clearTimeout(timer)
  }, [profile?.uid])

  const vendorRequests = useMemo<BookingCardItem[]>(() => {
    return requests.map((request) => ({
      requestId: String(request._id),
      bookingId: request.booking?._id,
      name: request.customer?.name || "Customer",
      event: request.event?.name || request.event?.eventType || "Event",
      date: request.event?.eventDate || "Date pending",
      location: request.event?.location?.label || "Location pending",
      guests: Number(request.event?.guestCount || 0),
      price: request.booking?.amount ? `₹${Number(request.booking.amount).toLocaleString("en-IN")}` : "Request-based",
      avatar: "/eventra_photos/wedding8.jpg",
      status:
        request.status === "rejected"
          ? "declined"
          : request.status === "accepted"
            ? "accepted"
            : "pending",
    }))
  }, [requests])

  const updateRequestStatus = async (index: number, status: "accepted" | "rejected") => {
    if (!profile?.uid) return

    const target = vendorRequests[index]
    if (!target?.requestId) return

    const previous = [...requests]
    setProcessingId(target.requestId)
    setError("")

    setRequests((current) =>
      current.map((item) =>
        item._id === target.requestId
          ? { ...item, status }
          : item,
      ),
    )

    const endpoint = status === "accepted"
      ? `/requests/${target.requestId}/accept`
      : `/requests/${target.requestId}/reject`

    const response = await apiFetch(endpoint, {
      method: "PATCH",
      body: JSON.stringify({ actorUserId: profile.uid }),
    })

    if (response?.error) {
      setRequests(previous)
      setError(response.message || "Could not update request status")
      showToast(response.message || "Request update failed", "error")
      setProcessingId(null)
      return
    }

    showToast(status === "accepted" ? "Booking accepted" : "Booking rejected", "success")
    await loadRequests()
    setProcessingId(null)
  }

  if (isLoading) {
    return <div>Loading booking requests...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (vendorRequests.length === 0) {
    return <div>No booking requests yet</div>
  }

  return (

<div className="space-y-6">

<div className="flex justify-between items-center">

<div>
<h1 className="text-2xl font-semibold">
Booking Requests
</h1>

<p className="text-gray-500 text-sm">
You have <span className="text-orange-500 font-medium">{vendorRequests.filter((item) => item.status === "pending").length} new leads</span> for the upcoming season.
</p>
</div>

<FilterBar />

</div>

{processingId && (
  <p className="text-sm text-gray-500">Processing request...</p>
)}

<div className="space-y-5">

{vendorRequests.map((b,i)=>(
<BookingCard
key={b.requestId}
name={b.name}
event={b.event}
date={b.date}
location={b.location}
guests={b.guests}
price={b.price}
avatar={b.avatar}
status={b.status}
onAccept={() => void updateRequestStatus(i, "accepted")}
onDecline={() => void updateRequestStatus(i, "rejected")}
onDetails={() => {
  if (b.bookingId) {
    router.push(`/vendor/bookedClientDetails?bookingId=${b.bookingId}`)
    return
  }
  router.push(`/vendor/bookedClientDetails?requestId=${b.requestId}`)
}}
/>
))}

</div>

</div>

)
}
