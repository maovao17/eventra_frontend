"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/context/ToastContext";
import Card from "@/components/ui/Card";
import { CreditCard } from "lucide-react";

export default function AdminPayments() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState("");

  const loadPayments = async () => {
    setLoading(true);
    setError("");

    try {
      const [res, payoutRes] = await Promise.all([
        apiFetch("/admin/payments"),
        apiFetch("/payouts"),
      ]);
      const paymentsData = (res as { data?: any[] } | null)?.data ?? res;
      const payoutsData = (payoutRes as { data?: any[] } | null)?.data ?? payoutRes;
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setPayouts(Array.isArray(payoutsData) ? payoutsData : []);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Could not load payments.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayments();
  }, []);

  const markPayoutPaid = async (payoutId: string) => {
    setProcessingId(payoutId);
    try {
      const updated = await apiFetch(`/payouts/${payoutId}/pay`, { method: "PATCH" });
      setPayouts((current) =>
        current.map((payout) => (payout._id === payoutId ? updated : payout)),
      );
      showToast("Vendor payout marked as paid.", "success");
    } catch (fetchError) {
      showToast(fetchError instanceof Error ? fetchError.message : "Could not update payout.", "error");
    } finally {
      setProcessingId("");
    }
  };

  if (loading) return <PageCardSkeleton count={4} className="md:grid-cols-1" />;
  if (error) {
    return (
      <ErrorState
        title="We couldn't load payments."
        description="Retry to refresh the latest transactions."
        onRetry={() => void loadPayments()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Payments List</h1>
      <p className="theme-muted mb-8">All payment transactions.</p>

      <div className="space-y-4">
        {payments.map((payment) => (
          <Card key={payment._id}>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Payment #{payment._id?.slice(-6)}</h3>
                  <p className="theme-muted text-sm">Booking: {payment.bookingId}</p>
                  <p className="theme-muted text-sm">Vendor: {payment.vendorId || "N/A"}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[var(--primary)]">₹{payment.amount}</div>
                  <span className={`text-sm px-3 py-1 rounded-full ${payment.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm theme-muted md:grid-cols-3">
                <div>Booking amount: ₹{Number(payment.bookingAmount || 0).toLocaleString("en-IN")}</div>
                <div>Platform fee: ₹{Number(payment.platformFee || 0).toLocaleString("en-IN")}</div>
                <div>Commission: ₹{Number(payment.commissionAmount || 0).toLocaleString("en-IN")}</div>
              </div>
              {(() => {
                const payout = payouts.find((item) => item.paymentId === payment._id || item.bookingId === payment.bookingId)
                if (!payout) return null
                return (
                  <div className="mt-4 rounded-2xl bg-[var(--surface)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">Vendor payout</p>
                        <p className="theme-muted text-sm">
                          ₹{Number(payout.payoutAmount || 0).toLocaleString("en-IN")} • {payout.status}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void markPayoutPaid(payout._id)}
                        disabled={payout.status === "paid" || processingId === payout._id}
                        className="rounded-full border px-4 py-2 text-sm"
                      >
                        {payout.status === "paid"
                          ? "Paid"
                          : processingId === payout._id
                            ? "Updating..."
                            : "Mark Paid"}
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </Card>
        ))}
      </div>
      {payments.length === 0 && (
        <EmptyState
          title="No payments found"
          description="Payment activity will appear here once customers begin completing bookings."
          secondaryAction={
            <button
              type="button"
              onClick={() => void loadPayments()}
              className="rounded-full border px-5 py-2 text-sm font-medium"
            >
              Retry
            </button>
          }
        />
      )}
    </div>
  );
}
