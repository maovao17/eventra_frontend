"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import BookingCard from "@/components/vendor/BookingCard"
import FilterBar from "@/components/vendor/FilterBar"
import { apiFetch } from "@/app/lib/api"
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"

type RequestStatus = "pending" | "accepted" | "rejected"

type VendorRequest = {
  _id: string
  status: RequestStatus
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
  amount?: number
  booking?: {
    _id?: string
    amount?: number
  }
}

type BookingCardItem = {
  requestId: string
  bookingId: string
  name: string
  event: string
  date: string
  location: string
  guests: number
  price: string
  avatar: string
  status: RequestStatus
}

export default function BookingRequests() {
  const router = useRouter()
  const { profile } = useAuth()
  const { showToast } = useToast()

  const [requests, setRequests] = useState<VendorRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState("")

  const loadRequests = async () => {
    if (!profile?.uid) return

    setIsLoading(true)
    setError("")

    try {
      const response = await apiFetch(`/requests`)
      setRequests(Array.isArray(response) ? response : [])
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load booking requests"
      setError(message)
      showToast(message, "error")
    } finally {
      setIsLoading(false)
    }
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
      bookingId: String(request.booking?._id || ""),
      name: request.customer?.name || "Customer",
      event: request.event?.name || request.event?.eventType || "Event",
      date: request.event?.eventDate || "Date pending",
      location: request.event?.location?.label || "Location pending",
      guests: Number(request.event?.guestCount || 0),
      price: request.booking?.amount
        ? `₹${Number(request.booking.amount).toLocaleString("en-IN")}`
        : "TBD",
      avatar: "/eventra_photos/wedding8.jpg",
      status: request.status as RequestStatus,
    }))
  }, [requests])

  const updateBookingStatusHandler = async (index: number, status: "accepted" | "rejected") => {
    const target = vendorRequests[index]
    if (!target?.requestId) return

    try {
      setIsMutating(true)
      const response = await apiFetch(`/requests/${target.requestId}/${status === "accepted" ? "accept" : "reject"}`, {
        method: "PATCH",
      })

      showToast(status === "accepted" ? "Request accepted" : "Request rejected", "success")
      if (status === "accepted") {
        const bookingId = String(response?.booking?._id || "")
        if (bookingId) {
          router.push(`/vendor/bookedClientDetails?bookingId=${bookingId}`)
        }
      }
      await loadRequests()
    } catch {
      showToast("Update failed", "error")
    } finally {
      setIsMutating(false)
    }
  }

  if (isLoading) {
    return <PageCardSkeleton count={3} className="md:grid-cols-1" />
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load booking requests."
        description={error}
        onRetry={() => void loadRequests()}
        retryLabel="Retry"
      />
    )
  }

  if (vendorRequests.length === 0) {
    return (
      <EmptyState
        title="No booking requests yet"
        description="New customer requests will show up here as soon as they arrive."
      />
    )
  }

  return (

<div className="space-y-6">

<div className="flex justify-between items-center">

<div>
<h1 className="text-2xl font-semibold">
Booking Requests
</h1>

<p className="text-gray-500 text-sm">
You have <span className="text-orange-500 font-medium">{vendorRequests.filter((item) => item.status === "pending").length} pending requests</span>.
</p>
</div>

<FilterBar />

</div>

{isMutating && (
  <p className="text-sm text-gray-500">Updating...</p>
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
bookingId={b.bookingId}
status={b.status}
onAccept={b.status === "pending" ? () => void updateBookingStatusHandler(i, "accepted") : undefined}
onDecline={b.status === "pending" ? () => void updateBookingStatusHandler(i, "rejected") : undefined}
onDetails={b.bookingId ? () => router.push(`/vendor/bookedClientDetails?bookingId=${b.bookingId}`) : undefined}
onChat={b.bookingId ? () => router.push(`/vendor/messages?bookingId=${b.bookingId}`) : undefined}
disabled={isMutating} 
/>
))}

</div>

</div>

)
}
