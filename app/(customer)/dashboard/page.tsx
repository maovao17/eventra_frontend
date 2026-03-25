"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import DashboardCard from "@/components/dashboard/DashboardCard"
import DashboardContainer from "@/components/dashboard/DashboardContainer"
import DashboardGrid from "@/components/dashboard/DashboardGrid"
import { useAuth } from "@/context/AuthContext"
import { useEvent } from "@/context/EventContext"

export default function DashboardPage() {
  const router = useRouter()
  const { profile } = useAuth()
const { currentEvent, selectedVendors, selectedServices, totalPrice, formatCurrency, bookings } = useEvent()

  useEffect(() => {
    if (!profile) {
      router.replace("/login");
      return;
    }
    if (profile?.role === "vendor") {
      router.replace("/vendor/requests")
    }
  }, [profile, router])

  return (
    <DashboardContainer
      title={`Welcome${profile?.name ? `, ${profile.name}` : ""}`}
      subtitle={`Role: ${profile?.role || "User"} | Phone: ${profile?.phone || "N/A"} - Manage event setup, vendor coordination, payments, and chat from one place.`}
    >
      <DashboardGrid>
        <DashboardCard href="/templates" title="Start Planning">
          <p className="theme-muted text-sm">
            Browse templates and move into event creation.
          </p>
        </DashboardCard>

        <DashboardCard href="/events/create" title="Create Event">
          <p className="theme-muted text-sm">
            Launch a new event flow and continue to vendors.
          </p>
        </DashboardCard>

        <DashboardCard href="/vendors" title="Find Vendors">
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

      <h3 className="text-xl font-semibold mt-8">Completed Bookings</h3>
      {bookings.filter((b: any) => b.status === "completed").length === 0 ? (
        <p className="theme-muted text-center py-8">No completed bookings available for review.</p>
      ) : (
        <DashboardGrid>
          {bookings.filter((b: any) => b.status === "completed").map((booking: any) => (
            <DashboardCard key={booking.id} title={`Vendor Booking - ${booking.vendorId?.slice(-4)}`}>
              <p className="theme-muted text-sm mb-3">Amount: {formatCurrency(booking.amount)}</p>
              <button
                onClick={() => router.push(`/review?bookingId=${booking.id}`)}
                className="w-full theme-button py-2 rounded-lg"
              >
                Submit Review
              </button>
            </DashboardCard>
          ))}
        </DashboardGrid>
      )}

      <div className="flex gap-4">

        <button
          type="button"
          onClick={() => router.push("/templates")}
          className="theme-button rounded-xl px-6 py-3"
        >
          Go to Templates
        </button>

        <button
          type="button"
          onClick={() => router.push("/messages")}
          className="rounded-xl border px-6 py-3"
        >
          Open Chats
        </button>
      </div>
    </DashboardContainer>
  )
}
