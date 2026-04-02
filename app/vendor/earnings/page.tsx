"use client";

import { useEffect, useState } from "react";
import { ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { apiFetch } from "@/app/lib/api";
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
    pendingPayouts: 0,
    paidOut: 0,
  });
  const [payoutList, setPayoutList] = useState([]); 
  const [processing, setProcessing] = useState('');

  useEffect(() => {
    setLoading(true);
    setError("");
    void refreshDashboard().finally(() => setLoading(false));
  }, [refreshDashboard]);

  useEffect(() => {
    const loadPayouts = async () => {
      if (!dashboard) return;
      if (Boolean(dashboard?.error)) {
        setError(String(dashboard.message || "Failed to load earnings."));
        return;
      }

      try {
        const payouts = await getVendorPayouts();
        const payoutList = Array.isArray(payouts) ? payouts : [];

        setStats({
          totalBookings: Number(dashboard?.totalBookings || 0),
          pendingRequests: Number(dashboard?.pendingRequests || 0),
          revenue: Number(
            payoutList.reduce((sum, payout) => sum + Number(payout.payoutAmount || 0), 0) || 0,
          ),
          upcomingEvents: Number(dashboard?.upcomingEvents || 0),
          pendingPayouts: payoutList
            .filter((payout) => payout.status === "pending")
            .reduce((sum, payout) => sum + Number(payout.payoutAmount || 0), 0),
          paidOut: payoutList
            .filter((payout) => payout.status === "paid")
            .reduce((sum, payout) => sum + Number(payout.payoutAmount || 0), 0),
        });
        setPayoutList(payoutList);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load payouts.");
      }
    };

    void loadPayouts();
  }, [dashboard]);

  if (loading || loadingDashboard) {
    return <PageCardSkeleton count={4} className="md:grid-cols-2 xl:grid-cols-4" />;
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load earnings."
        description={error}
        onRetry={() => void refreshDashboard()}
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
          {payoutList.filter((payout: any) => payout.status === "pending").map((payout: any) => (
            <div key={payout._id} className="theme-card p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">₹{Number(payout.payoutAmount).toLocaleString("en-IN")}</p>
                <p className="text-sm text-gray-500">Booking: {payout.bookingId?.slice(-6)}</p>
              </div>
              <button
                onClick={() => {
                  setProcessing(payout._id);
                  simulatePayout(payout._id).then(() => {
                    setProcessing('');
                    showToast('Payout simulated successfully', 'success');
                  }).catch(() => setProcessing(''));
                }}
                disabled={processing === payout._id}
                className="theme-button px-4 py-1 text-sm"
              >
                {processing === payout._id ? 'Simulating...' : 'Simulate Payout'}
              </button>
            </div>
          ))}
          {payoutList.filter((p: any) => p.status === "pending").length === 0 && (
            <p className="text-center text-gray-500 py-8">No pending payouts</p>
          )}
        </div>
      </div>
    </div>
  );
}
function getVendorPayouts() {
  throw new Error("Function not implemented.");
}

