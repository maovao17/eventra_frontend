"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { Users, UserCheck, Calendar } from "lucide-react";

type RecentBooking = {
  _id: string;
  customerId?: string;
  vendorId?: string;
  eventId?: string;
  status?: string;
  amount?: number;
  createdAt?: string;
  eventName?: string;
  customerName?: string;
};

export default function AdminDashboard() {
  const { showToast } = useToast();
  const { profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ totalVendors: 0, totalUsers: 0, totalEvents: 0 });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const [usersRes, vendorsRes, eventsRes, bookingsRes] = await Promise.all([
        apiFetch("/admin/users"),
        apiFetch("/admin/vendors"),
        apiFetch("/admin/events"),
        apiFetch("/admin/bookings"),
      ]);
      setStats({
        totalVendors: Array.isArray(vendorsRes) ? vendorsRes.length : 0,
        totalUsers: Array.isArray(usersRes) ? usersRes.length : 0,
        totalEvents: Array.isArray(eventsRes) ? eventsRes.length : 0,
      });
      setRecentBookings(
        Array.isArray(bookingsRes)
          ? [...bookingsRes].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)
          : []
      );
    } catch {
      showToast("Could not load dashboard stats.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && profile) void loadStats();
  }, [authLoading, profile]);

  const statusColor = (status?: string) => {
    switch (status) {
      case "confirmed": return "text-green-600 font-medium";
      case "pending": return "text-amber-500 font-medium";
      case "cancelled":
      case "rejected": return "text-red-500 font-medium";
      default: return "text-blue-600 font-medium";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="theme-muted mt-1 text-sm">
          Here's what's happening in your event management ecosystem today.
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="theme-card p-6 animate-pulse h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <div className="theme-card p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <UserCheck size={18} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm theme-muted">Total Vendors</p>
              <p className="text-3xl font-bold mt-1">{stats.totalVendors.toLocaleString()}</p>
            </div>
          </div>
          <div className="theme-card p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <Users size={18} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm theme-muted">Total Users</p>
              <p className="text-3xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
          <div className="theme-card p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <Calendar size={18} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm theme-muted">Total Events</p>
              <p className="text-3xl font-bold mt-1">{stats.totalEvents.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity + Banner */}
      <div className="grid grid-cols-[1fr_280px] gap-6">
        <div className="theme-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Event Activity</h2>
          {recentBookings.length === 0 ? (
            <p className="theme-muted text-sm">No activity yet. Bookings will appear here.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b theme-muted text-xs uppercase tracking-wide">
                  <th className="py-3 text-left font-medium">Event Name</th>
                  <th className="py-3 text-left font-medium">Customer</th>
                  <th className="py-3 text-left font-medium">Status</th>
                  <th className="py-3 text-right font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking._id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{booking.eventName || `Event`}</td>
                    <td className="py-3 theme-muted">{booking.customerName || booking.customerId?.slice(-6) || "—"}</td>
                    <td className={`py-3 capitalize ${statusColor(booking.status)}`}>
                      {booking.status || "pending"}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {booking.amount ? `Rs ${Number(booking.amount).toLocaleString("en-IN")}` : "NIL"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Promo banner */}
        <div className="rounded-2xl bg-[linear-gradient(135deg,var(--primary),#c45e3e)] p-8 flex items-center justify-center text-white">
          <p className="text-2xl font-bold leading-snug text-center">
            Turning plans into performance.
          </p>
        </div>
      </div>
    </div>
  );
}
