"use client";

import { useEffect, useState } from "react";
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useVendorData } from "@/context/VendorContext";
import { useAuth } from "@/context/AuthContext";
import { getVendorPayouts } from "@/app/lib/vendorApi";

export default function Earnings() {
  const { dashboard, loadingDashboard, refreshVendorProfile } = useVendorData();
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingRequests: 0,
    revenue: 0,
    upcomingEvents: 0,
    pendingPayouts: 0,
    paidOut: 0,
  });

  const [payoutList, setPayoutList] = useState<any[]>([]);

  // Refresh vendor profile
  useEffect(() => {
    setLoading(true);
    setError("");

    void refreshVendorProfile().finally(() => {
      setLoading(false);
    });
  }, []);

  // Load payouts
  useEffect(() => {
    const loadPayouts = async () => {
      if (!profile?.uid || !dashboard) {
        setLoading(false);
        return;
      }

      if ((dashboard as any)?.error) {
        setError(String((dashboard as any).message || "Failed to load earnings."));
        setLoading(false);
        return;
      }

      try {
        const res = await getVendorPayouts();

        const safePayouts = (res as any)?.data ?? (Array.isArray(res) ? res : []);

        setStats({
          totalBookings: Number(dashboard?.totalBookings || 0),
          pendingRequests: Number(dashboard?.pendingRequests || 0),
          revenue: safePayouts.reduce(
            (sum: number, payout: any) =>
              sum + Number(payout?.payoutAmount || 0),
            0
          ),
          upcomingEvents: Number(dashboard?.upcomingEvents || 0),

          pendingPayouts: safePayouts
            .filter((p: any) => p?.status === "pending")
            .reduce(
              (sum: number, p: any) =>
                sum + Number(p?.payoutAmount || 0),
              0
            ),

          paidOut: safePayouts
            .filter((p: any) => p?.status === "paid")
            .reduce(
              (sum: number, p: any) =>
                sum + Number(p?.payoutAmount || 0),
              0
            ),
        });

        setPayoutList(safePayouts);
      } catch (err: any) {
        console.error("Earnings error:", err);
        setError(err?.message || "Failed to load payouts.");
        setPayoutList([]);
      } finally {
        setLoading(false);
      }
    };

    void loadPayouts();
  }, [profile?.uid]);

  if (loading || loadingDashboard) {
    return <PageCardSkeleton count={4} className="md:grid-cols-2 xl:grid-cols-4" />;
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load earnings."
        description={error}
        onRetry={() => void refreshVendorProfile()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        Earnings Overview
      </h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="theme-card p-5">
          <p>Total Vendor Earnings</p>
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
          <p>Pending Payouts</p>
          <h3>₹{stats.pendingPayouts.toLocaleString("en-IN")}</h3>
        </div>

        <div className="theme-card p-5">
          <p>Paid Out</p>
          <h3>₹{stats.paidOut.toLocaleString("en-IN")}</h3>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Pending Payouts List</h2>

        <div className="space-y-3">
          {payoutList
            .filter((p: any) => p?.status === "pending")
            .map((p: any) => (
              <div
                key={p?._id}
                className="theme-card p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    ₹{Number(p?.payoutAmount || 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Booking: {p?.bookingId?.slice?.(-6) || "N/A"}
                  </p>
                </div>
              </div>
            ))}

          {payoutList.filter((p: any) => p?.status === "pending").length === 0 && (
            <EmptyState
              title="No pending payouts"
              description="Completed paid bookings will appear here."
            />
          )}
        </div>
      </div>
    </div>
  );
}