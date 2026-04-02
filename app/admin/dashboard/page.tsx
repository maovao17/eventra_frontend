"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/context/ToastContext";
import Card from "@/components/ui/Card";
import { Users, UserCheck, Calendar, CreditCard } from "lucide-react";

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalBookings: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setError("");

    try {
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
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Could not load dashboard.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
  }, []);

  if (loading) {
    return <PageCardSkeleton count={4} className="md:grid-cols-2 xl:grid-cols-4" />;
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load the admin dashboard."
        description="Retry to fetch the latest platform totals."
        onRetry={() => void loadStats()}
        retryLabel="Retry"
      />
    );
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
