"use client";

import DashboardCard from "@/components/dashboard/DashboardCard";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import { useEvent } from "@/context/EventContext";

export default function DashboardPage() {
  const { currentEvent, recommendedVendors, formatCurrency } = useEvent()

  return (
    <DashboardContainer
      title="Hello Sarah"
      subtitle="Your planning workspace keeps event progress, budget health, and next actions in one place."
    >
      <DashboardGrid>
        <DashboardCard title="Budget Overview">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="theme-muted text-sm">Remaining</p>
              <p className="text-3xl font-bold">
                {currentEvent
                  ? formatCurrency(currentEvent.budget - currentEvent.spent)
                  : formatCurrency(0)}
              </p>
            </div>
            <span className="theme-pill px-3 py-1 text-xs font-semibold">
              {currentEvent
                ? `${Math.round((currentEvent.spent / Math.max(currentEvent.budget, 1)) * 100)}% used`
                : "0% used"}
            </span>
          </div>

          <div className="theme-progress-track h-3 w-full rounded-full">
            <div
              className="h-3 rounded-full bg-[var(--primary)]"
              style={{
                width: currentEvent
                  ? `${Math.min((currentEvent.spent / Math.max(currentEvent.budget, 1)) * 100, 100)}%`
                  : "0%",
              }}
            />
          </div>
        </DashboardCard>

        <DashboardCard title="Next Event">
          <p className="text-xl font-semibold">{currentEvent?.name ?? "No active event"}</p>
          <p className="theme-muted mt-2 text-sm">
            {currentEvent ? `${currentEvent.date} • ${currentEvent.location}` : "Create an event to begin planning"}
          </p>
          <p className="theme-muted mt-4 text-sm">
            {currentEvent?.notes ??
              "Once you create an event, Eventra will track services, requests, and recommendations here."}
          </p>
        </DashboardCard>

        <DashboardCard title="Quick Status">
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="theme-muted">Vendors shortlisted</span>
              <span className="font-semibold">{currentEvent?.vendorIds.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-muted">Pending replies</span>
              <span className="font-semibold">{Math.max((currentEvent?.services.length ?? 0) - (currentEvent?.vendorIds.length ?? 0), 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="theme-muted">Tasks completed</span>
              <span className="font-semibold">{currentEvent?.vendorIds.length ?? 0}</span>
            </div>
          </div>
        </DashboardCard>
      </DashboardGrid>

      <DashboardCard title="Recommended Vendors">
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedVendors.map((vendor) => (
            <div key={vendor.id} className="theme-surface rounded-2xl p-4">
              <p className="font-semibold">{vendor.name}</p>
              <p className="theme-muted mt-1 text-sm">{vendor.category}</p>
              <p className="theme-primary mt-3 text-sm">
                Starts at {formatCurrency(vendor.price)}
              </p>
            </div>
          ))}
        </div>
      </DashboardCard>
    </DashboardContainer>
  );
}
