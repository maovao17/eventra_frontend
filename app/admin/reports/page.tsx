"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/context/ToastContext";
import { Download, RefreshCw } from "lucide-react";

type ReportData = {
  users: any[];
  vendors: any[];
  bookings: any[];
  payments: any[];
  events: any[];
};

function downloadCSV(filename: string, rows: string[][], headers: string[]) {
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [usersRes, vendorsRes, bookingsRes, paymentsRes, eventsRes] = await Promise.all([
        apiFetch("/admin/users"),
        apiFetch("/admin/vendors"),
        apiFetch("/admin/bookings"),
        apiFetch("/admin/payments"),
        apiFetch("/admin/events"),
      ]);

      setData({
        users: Array.isArray(usersRes) ? usersRes : [],
        vendors: Array.isArray(vendorsRes) ? vendorsRes : [],
        bookings: Array.isArray(bookingsRes) ? bookingsRes : [],
        payments: Array.isArray(paymentsRes) ? paymentsRes : [],
        events: Array.isArray(eventsRes) ? eventsRes : [],
      });
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Could not load reports.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const exportUsers = () => {
    if (!data) return;
    const headers = ["ID", "Name", "Phone", "Role", "Email"];
    const rows = data.users.map((u: any) => [
      u._id || u.userId || "",
      u.name || "",
      u.phoneNumber || u.phone || "",
      u.role || "",
      u.email || "",
    ]);
    downloadCSV("eventra_users.csv", rows, headers);
    showToast("Users report downloaded.", "success");
  };

  const exportVendors = () => {
    if (!data) return;
    const headers = ["ID", "Business Name", "Category", "City", "Approved", "Status"];
    const rows = data.vendors.map((v: any) => [
      v._id || "",
      v.businessName || "",
      Array.isArray(v.category) ? v.category.join(", ") : v.category || "",
      v.location?.city || "",
      v.isApproved ? "Yes" : "No",
      v.status || "",
    ]);
    downloadCSV("eventra_vendors.csv", rows, headers);
    showToast("Vendors report downloaded.", "success");
  };

  const exportBookings = () => {
    if (!data) return;
    const headers = ["ID", "Customer ID", "Vendor ID", "Event ID", "Amount", "Status", "Payment Status"];
    const rows = data.bookings.map((b: any) => [
      b._id || "",
      b.customerId || "",
      b.vendorId || "",
      b.eventId || "",
      b.amount || 0,
      b.status || "",
      b.paymentStatus || "",
    ]);
    downloadCSV("eventra_bookings.csv", rows, headers);
    showToast("Bookings report downloaded.", "success");
  };

  const exportPayments = () => {
    if (!data) return;
    const headers = ["ID", "Booking ID", "Amount", "Platform Fee", "Commission", "Status"];
    const rows = data.payments.map((p: any) => [
      p._id || "",
      p.bookingId || "",
      p.amount || 0,
      p.platformFee || 0,
      p.commissionAmount || 0,
      p.status || "",
    ]);
    downloadCSV("eventra_payments.csv", rows, headers);
    showToast("Payments report downloaded.", "success");
  };

  const exportEvents = () => {
    if (!data) return;
    const headers = ["ID", "Name", "Type", "Date", "Location", "Budget", "Status"];
    const rows = data.events.map((e: any) => [
      e._id || "",
      e.name || e.eventType || "",
      e.eventType || "",
      e.eventDate || e.date || "",
      typeof e.location === "object" ? e.location?.city || e.location?.label || "" : e.location || "",
      e.budget || 0,
      e.status || "",
    ]);
    downloadCSV("eventra_events.csv", rows, headers);
    showToast("Events report downloaded.", "success");
  };

  if (loading) return <PageCardSkeleton count={4} className="md:grid-cols-2" />;
  if (error) {
    return (
      <ErrorState
        title="We couldn't load reports."
        description="Retry to fetch the latest platform data."
        onRetry={() => void loadData()}
        retryLabel="Retry"
      />
    );
  }

  if (!data) return null;

  const totalRevenue = data.payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
  const platformFees = data.payments.reduce((sum: number, p: any) => sum + Number(p.platformFee || 0), 0);
  const completedBookings = data.bookings.filter((b: any) => b.status === "completed").length;
  const approvedVendors = data.vendors.filter((v: any) => v.isApproved).length;

  const reportCards = [
    {
      title: "Users Report",
      description: `${data.users.length} registered users — names, roles, and contact info.`,
      count: data.users.length,
      label: "Users",
      onExport: exportUsers,
    },
    {
      title: "Vendors Report",
      description: `${data.vendors.length} vendors (${approvedVendors} approved) — business names, categories, locations.`,
      count: data.vendors.length,
      label: "Vendors",
      onExport: exportVendors,
    },
    {
      title: "Bookings Report",
      description: `${data.bookings.length} bookings — statuses, amounts, customer and vendor IDs.`,
      count: data.bookings.length,
      label: "Bookings",
      onExport: exportBookings,
    },
    {
      title: "Payments Report",
      description: `${data.payments.length} payment transactions — amounts, platform fees, commission.`,
      count: data.payments.length,
      label: "Payments",
      onExport: exportPayments,
    },
    {
      title: "Events Report",
      description: `${data.events.length} events — types, dates, locations, budgets, statuses.`,
      count: data.events.length,
      label: "Events",
      onExport: exportEvents,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Reports</h1>
          <p className="theme-muted">
            Export platform data as CSV files for analysis and record keeping.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadData()}
          className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Summary snapshot */}
      <div className="theme-card p-6">
        <h2 className="text-lg font-semibold mb-4">Platform Snapshot</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{data.users.length}</p>
            <p className="theme-muted text-sm">Users</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{approvedVendors}</p>
            <p className="theme-muted text-sm">Active Vendors</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{completedBookings}</p>
            <p className="theme-muted text-sm">Completed Bookings</p>
          </div>
          <div>
            <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString("en-IN")}</p>
            <p className="theme-muted text-sm">Total Revenue</p>
          </div>
          <div>
            <p className="text-2xl font-bold">₹{platformFees.toLocaleString("en-IN")}</p>
            <p className="theme-muted text-sm">Platform Fees</p>
          </div>
        </div>
      </div>

      {/* Export cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {reportCards.map((card) => (
          <div key={card.title} className="theme-card p-6 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{card.title}</h3>
              <p className="theme-muted text-sm">{card.description}</p>
            </div>
            <button
              type="button"
              onClick={card.onExport}
              disabled={card.count === 0}
              className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-40 shrink-0"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
