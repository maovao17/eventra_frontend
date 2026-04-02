"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import Card from "@/components/ui/Card";
import { Users, UserCheck, Calendar, CreditCard } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalBookings: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const [usersRes, vendorsRes, bookingsRes, paymentsRes] = await Promise.all([
        apiFetch("/admin/users"),
        apiFetch("/admin/vendors"),
        apiFetch("/admin/bookings"),
        apiFetch("/admin/payments"),
      ]);
      setStats({
        totalUsers: Array.isArray(usersRes) ? usersRes.length : 0,
        totalVendors: Array.isArray(vendorsRes) ? vendorsRes.length : 0,
        totalBookings: Array.isArray(bookingsRes) ? bookingsRes.length : 0,
        totalPayments: Array.isArray(paymentsRes) ? paymentsRes.length : 0,
      });
      setLoading(false);
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Total Users</p>
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Total Vendors</p>
            <UserCheck className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalVendors}</div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Total Bookings</p>
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Total Payments</p>
            <CreditCard className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
