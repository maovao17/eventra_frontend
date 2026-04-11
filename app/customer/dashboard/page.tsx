"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DashboardCard from "@/components/dashboard/DashboardCard"
import DashboardContainer from "@/components/dashboard/DashboardContainer"
import DashboardGrid from "@/components/dashboard/DashboardGrid"
import { EmptyState, ErrorState, PageCardSkeleton, PageIntroSkeleton } from "@/components/ui/PageState"
import { apiFetch } from "@/app/lib/api"
import { useAuth } from "@/context/AuthContext"
import { useEvent } from "@/context/EventContext"
import { getDashboardPathForRole } from "@/lib/routes"

export default function DashboardPage() {
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const { currentEvent, selectedVendors, selectedServices, totalPrice, formatCurrency, bookings, isLoading, error, refreshData } = useEvent()
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!profile) {
      router.replace("/login")
      return
    }
    if (profile.role !== "customer") {
      router.replace(getDashboardPathForRole(profile.role))
    }
  }, [profile, router])

  useEffect(() => {
    if (!profile?.uid || profile.role !== "customer") return

    const loadNotifications = async () => {
      try {
        const response = await apiFetch("/notifications")
        setNotifications(Array.isArray(response) ? response.slice(0, 4) : [])
      } catch {
        setNotifications([])
      }
    }

    void loadNotifications()
  }, [profile?.uid, profile?.role])

  if (authLoading || isLoading) {
    return (
      <div className="space-y-8">
        <PageIntroSkeleton />
        <PageCardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load your dashboard."
        description="Retry to refresh your events, bookings, and planning summary."
        onRetry={() => void refreshData()}
        retryLabel="Retry"
      />
    )
  }

  return (
    <DashboardContainer
      title={`Welcome${profile?.name ? `, ${profile.name}` : ""}`}
      subtitle={`Role: ${profile?.role || "User"} | Phone: ${profile?.phone || "N/A"} - Manage event setup, vendor coordination, payments, and chat from one place.`}
    >
      <DashboardGrid>
        <DashboardCard href="/customer/templates" title="Start Planning">
          <p className="theme-muted text-sm">
            Browse templates and move into event creation.
          </p>
        </DashboardCard>

        <DashboardCard href="/customer/events/create" title="Create Event">
          <p className="theme-muted text-sm">
            Launch a new event flow and continue to vendors.
          </p>
        </DashboardCard>

        <DashboardCard href="/customer/vendors" title="Find Vendors">
          <p className="theme-muted text-sm">
            Review profiles, add vendors, and open chat threads.
          </p>
        </DashboardCard>
      </DashboardGrid>

      <DashboardGrid className="md:grid-cols-2">
        <DashboardCard title="Current Event">
          <p className="font-semibold">
            {currentEvent?.name ?? "No active event"}
          </p>
          <p className="theme-muted mt-2 text-sm">
            {currentEvent ? `${currentEvent.date} • ${currentEvent.location}` : "Create an event to begin."}
          </p>
        </DashboardCard>

        <DashboardCard title="Event Snapshot">
          <p className="theme-muted text-sm">
            Services: {selectedServices.length}
          </p>
          <p className="theme-muted mt-2 text-sm">
            Vendors: {selectedVendors.length}
          </p>
          <p className="mt-3 font-semibold">
            Total: {formatCurrency(totalPrice)}
          </p>
        </DashboardCard>
      </DashboardGrid>

      <div className="theme-card p-6">
        <h3 className="text-xl font-semibold">Recent Updates</h3>
        {notifications.length === 0 ? (
          <p className="theme-muted mt-3 text-sm">
            Booking updates and event reminders will appear here.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {notifications.map((notification) => (
              <div key={notification._id} className="theme-surface rounded-2xl p-4">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="theme-muted mt-1 text-xs">
                  {notification.type}
                  {notification.daysBefore ? ` • ${notification.daysBefore} day reminder` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold mt-8">My Bookings</h3>
      {bookings.length === 0 ? (
        <EmptyState
          title="Add your first event"
          description="Create an event, choose services, and send vendor requests to start receiving bookings."
          actionLabel="Create Event"
          actionHref="/customer/events/create"
          secondaryAction={
            <button
              type="button"
              onClick={() => router.push("/customer/vendors")}
              className="rounded-full border px-5 py-2 text-sm font-medium"
            >
              Explore Vendors
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="theme-card p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-semibold">{booking.eventName || 'Event Booking'}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'accepted' ? 'bg-amber-100 text-amber-800' :
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status === 'pending' ? 'Waiting for vendor' :
                   booking.status === 'accepted' ? 'Awaiting payment' :
                   booking.status === 'confirmed' ? 'Confirmed' :
                   booking.status === 'rejected' ? 'Rejected' :
                   'Completed'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm theme-muted mb-4">
                <div>Vendor: {booking.vendorName || booking.vendorId?.slice(-4)}</div>
                <div>Amount: {formatCurrency(booking.amount)}</div>
                <div>Date: {booking.eventDate || 'TBD'}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {booking.completionImages && booking.completionImages.length > 0 && (
                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Proof uploaded
                  </div>
                )}
                {['accepted', 'confirmed'].includes(booking.status) && (
                  <button
                    onClick={() => router.push(`/chat/booking-${booking.id}`)}
                    className="theme-button text-sm py-1 px-3 rounded-lg"
                  >
                    Chat
                  </button>
                )}
                {booking.status === 'completed' && (
                  <button
                    onClick={() => router.push(`/customer/review?bookingId=${booking.id}`)}
                    className="theme-button bg-blue-500 hover:bg-blue-600 text-sm py-1 px-3 rounded-lg"
                  >
                    Write Review
                  </button>
                )}
                {booking.status === 'rejected' && (
                  <button
                    onClick={() => router.push("/customer/vendors")}
                    className="border rounded-lg text-sm py-1 px-3 theme-muted hover:bg-gray-100"
                  >
                    Try Another Vendor
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}


        <div className="flex gap-4">

        <button
          type="button"
          onClick={() => router.push("/customer/templates")}
          className="theme-button"
        >
          Go to Templates
        </button>

        <button
          type="button"
          onClick={() => router.push("/customer/messages")}
          className="btn-secondary"
        >
          Open Chats
        </button>
      </div>
    </DashboardContainer>
  )
}
