"use client"

import { useEffect } from "react"
import { ErrorState, PageCardSkeleton } from "@/components/ui/PageState"
import { useVendorData } from "@/context/VendorContext"

export default function VendorDashboardPage() {
  const { dashboard, loadingDashboard, refreshDashboard } = useVendorData()

  useEffect(() => {
    void refreshDashboard()
  }, [refreshDashboard])

  if (loadingDashboard && !dashboard) {
    return <PageCardSkeleton count={4} className="md:grid-cols-2 xl:grid-cols-4" />
  }

  if (!loadingDashboard && !dashboard) {
    return (
      <ErrorState
        title="We couldn't load your dashboard."
        description="Retry to refresh bookings, pending requests, revenue, and ratings."
        onRetry={() => void refreshDashboard()}
        retryLabel="Retry"
      />
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Vendor Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="theme-card p-5">
          <p>Total Bookings</p>
          <h3 className="text-xl font-semibold">{Number(dashboard?.totalBookings || 0)}</h3>
        </div>

        <div className="theme-card p-5">
          <p>Pending Requests</p>
          <h3 className="text-xl font-semibold">{Number(dashboard?.pendingRequests || 0)}</h3>
        </div>

        <div className="theme-card p-5">
          <p>Monthly Revenue</p>
          <h3 className="text-xl font-semibold">₹{Number(dashboard?.monthlyRevenue || 0).toLocaleString("en-IN")}</h3>
        </div>

        <div className="theme-card p-5">
          <p>Rating</p>
          <h3 className="text-xl font-semibold">{Number(dashboard?.rating || 0).toFixed(1)}</h3>
        </div>
      </div>
    </div>
  )
}
