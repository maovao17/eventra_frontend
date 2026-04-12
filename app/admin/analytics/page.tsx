"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/context/ToastContext";
import Card from "@/components/ui/Card";
import { TrendingUp, Users, UserCheck, Calendar, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";

type AnalyticsData = {
  totalUsers: number;
  totalVendors: number;
  approvedVendors: number;
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  platformFeeRevenue: number;
  totalPayments: number;
  bookingConversionRate: number;
  avgBookingValue: number;
  categoryCounts: Record<string, number>;
};

export default function AnalyticsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const [usersRes, vendorsRes, bookingsRes, paymentsRes] = await Promise.all([
        apiFetch("/admin/users"),
        apiFetch("/admin/vendors"),
        apiFetch("/admin/bookings"),
        apiFetch("/admin/payments"),
      ]);

      const users = Array.isArray(usersRes) ? usersRes : [];
      const vendors = Array.isArray(vendorsRes) ? vendorsRes : [];
      const bookings = Array.isArray(bookingsRes) ? bookingsRes : [];
      const payments = Array.isArray(paymentsRes) ? paymentsRes : [];

      const confirmedBookings = bookings.filter((b: any) => b.status === "confirmed").length;
      const completedBookings = bookings.filter((b: any) => b.status === "completed").length;
      const pendingBookings = bookings.filter((b: any) => b.status === "pending").length;
      const cancelledBookings = bookings.filter((b: any) => b.status === "cancelled" || b.status === "rejected").length;

      const totalRevenue = payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
      const platformFeeRevenue = payments.reduce((sum: number, p: any) => sum + Number(p.platformFee || 0), 0);

      const approvedVendors = vendors.filter((v: any) => v.isApproved).length;

      const avgBookingValue = bookings.length > 0
        ? bookings.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0) / bookings.length
        : 0;

      const bookingConversionRate = bookings.length > 0
        ? Math.round(((confirmedBookings + completedBookings) / bookings.length) * 100)
        : 0;

      // Category counts from vendors
      const categoryCounts: Record<string, number> = {};
      vendors.forEach((v: any) => {
        const cats = Array.isArray(v.category) ? v.category : v.category ? [v.category] : [];
        cats.forEach((cat: string) => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      });

      setData({
        totalUsers: users.length,
        totalVendors: vendors.length,
        approvedVendors,
        totalBookings: bookings.length,
        confirmedBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings,
        totalRevenue,
        platformFeeRevenue,
        totalPayments: payments.length,
        bookingConversionRate,
        avgBookingValue,
        categoryCounts,
      });
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Could not load analytics.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, []);

  if (loading) return <PageCardSkeleton count={6} className="md:grid-cols-3" />;
  if (error) {
    return (
      <ErrorState
        title="We couldn't load analytics."
        description="Retry to fetch the latest platform statistics."
        onRetry={() => void loadAnalytics()}
        retryLabel="Retry"
      />
    );
  }

  if (!data) return null;

  const topCategories = Object.entries(data.categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const bookingStatusItems = [
    { label: "Confirmed", count: data.confirmedBookings, color: "text-green-600", bg: "bg-green-100" },
    { label: "Completed", count: data.completedBookings, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Pending", count: data.pendingBookings, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Cancelled/Rejected", count: data.cancelledBookings, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Analytics</h1>
        <p className="theme-muted">Platform-wide metrics and performance overview.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Total Users</p>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.totalUsers}</div>
          <p className="theme-muted text-xs mt-1">Registered on platform</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Approved Vendors</p>
            <UserCheck className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.approvedVendors}</div>
          <p className="theme-muted text-xs mt-1">{data.totalVendors - data.approvedVendors} pending approval</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Total Bookings</p>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{data.totalBookings}</div>
          <p className="theme-muted text-xs mt-1">{data.bookingConversionRate}% conversion rate</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Total Revenue</p>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">₹{data.totalRevenue.toLocaleString("en-IN")}</div>
          <p className="theme-muted text-xs mt-1">From {data.totalPayments} payments</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Platform Fees Earned</p>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">₹{data.platformFeeRevenue.toLocaleString("en-IN")}</div>
          <p className="theme-muted text-xs mt-1">Net platform income</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium">Avg Booking Value</p>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">₹{Math.round(data.avgBookingValue).toLocaleString("en-IN")}</div>
          <p className="theme-muted text-xs mt-1">Per booking</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Booking Breakdown */}
        <div className="theme-card p-6">
          <h2 className="text-xl font-semibold mb-4">Booking Status Breakdown</h2>
          <div className="space-y-3">
            {bookingStatusItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.bg} ${item.color}`}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color.replace("text-", "bg-")}`}
                      style={{
                        width: data.totalBookings > 0
                          ? `${Math.round((item.count / data.totalBookings) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-6 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Service Categories */}
        <div className="theme-card p-6">
          <h2 className="text-xl font-semibold mb-4">Top Vendor Categories</h2>
          {topCategories.length === 0 ? (
            <p className="theme-muted text-sm">No category data available yet.</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[var(--primary)]"
                        style={{
                          width: `${Math.round((count / data.totalVendors) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Row */}
      <div className="theme-card p-6">
        <h2 className="text-xl font-semibold mb-4">Platform Health Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="flex justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-2xl font-bold">{data.completedBookings}</p>
            <p className="theme-muted text-sm">Completed Events</p>
          </div>
          <div>
            <div className="flex justify-center mb-2">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <p className="text-2xl font-bold">{data.pendingBookings}</p>
            <p className="theme-muted text-sm">Awaiting Response</p>
          </div>
          <div>
            <div className="flex justify-center mb-2">
              <UserCheck className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{data.totalVendors - data.approvedVendors}</p>
            <p className="theme-muted text-sm">Vendors Pending</p>
          </div>
          <div>
            <div className="flex justify-center mb-2">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-2xl font-bold">{data.cancelledBookings}</p>
            <p className="theme-muted text-sm">Cancelled / Rejected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
