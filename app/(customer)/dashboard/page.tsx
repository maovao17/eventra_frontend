"use client"

import { useRouter } from "next/navigation"
import DashboardCard from "@/components/dashboard/DashboardCard"
import DashboardContainer from "@/components/dashboard/DashboardContainer"
import DashboardGrid from "@/components/dashboard/DashboardGrid"
import { useAuth } from "@/context/AuthContext"
import { useEvent } from "@/context/EventContext"

export default function DashboardPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const { currentEvent, selectedVendors, selectedServices, totalPrice, formatCurrency } = useEvent()

  return (
    <DashboardContainer
      title={`Welcome${profile?.name ? `, ${profile.name}` : ""}`}
      subtitle="Manage event setup, vendor coordination, payments, and chat from one place."
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
