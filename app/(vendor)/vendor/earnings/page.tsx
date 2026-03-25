"use client";

import { useEffect, useState } from "react";
import { useVendorData } from "@/context/VendorContext";

export default function Earnings() {
  const { dashboard, loadingDashboard, refreshDashboard } = useVendorData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingRequests: 0,
    revenue: 0,
    upcomingEvents: 0,
  });

  useEffect(() => {
    setLoading(true);
    setError("");
    void refreshDashboard().finally(() => setLoading(false));
  }, [refreshDashboard]);

  useEffect(() => {
    if (!dashboard) return;
    if (Boolean(dashboard?.error)) {
      setError(String(dashboard.message || "Failed to load earnings."));
      return;
    }

    const totalRevenue = Number(dashboard?.revenue || dashboard?.monthlyRevenue || 0);
    const commissionRate = 0.1;
    const afterCommission = Math.max(0, totalRevenue - totalRevenue * commissionRate);

    setStats({
      totalBookings: Number(dashboard?.totalBookings || 0),
      pendingRequests: Number(dashboard?.pendingRequests || 0),
      revenue: Number(afterCommission || 0),
      upcomingEvents: Number(dashboard?.upcomingEvents || 0),
    });
  }, [dashboard]);

  if (loading || loadingDashboard) {
    return <p>Loading earnings...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        Earnings Overview
      </h1>

      <div className="grid grid-cols-4 gap-6">
        <div className="theme-card p-5">
          <p>Total Revenue</p>
          <h3 className="text-xl font-semibold">
            ₹{stats.revenue.toLocaleString("en-IN")}
          </h3>
        </div>

        <div className="theme-card p-5">
          <p>Total Bookings</p>
          <h3>{stats.totalBookings}</h3>
        </div>

        <div className="theme-card p-5">
          <p>Pending Requests</p>
          <h3>{stats.pendingRequests}</h3>
        </div>

        <div className="theme-card p-5">
          <p>Upcoming Events</p>
          <h3>{stats.upcomingEvents}</h3>
        </div>
      </div>
    </div>
  );
}
