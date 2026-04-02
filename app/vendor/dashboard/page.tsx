"use client"

import { useEffect } from "react"
import { useVendorData } from "@/context/VendorContext"

export default function VendorDashboardPage() {
  const { dashboard, loadingDashboard, refreshDashboard } = useVendorData()

  useEffect(() => {
    void refreshDashboard()
  }, [refreshDashboard])

  if (loadingDashboard && !dashboard) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="theme-card h-28 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Vendor Dashboard</h1>

      <div className="grid grid-cols-4 gap-6">
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
