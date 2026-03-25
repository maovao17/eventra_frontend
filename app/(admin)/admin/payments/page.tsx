"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import Card from "@/components/ui/Card";
import { CreditCard, CheckCircle } from "lucide-react";

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      const res = await apiFetch("/admin/payments");
      if (res?.error) {
        setError(res.message);
      } else {
        setPayments(Array.isArray(res) ? res : []);
      }
      setLoading(false);
    };
    loadPayments();
  }, []);

  if (loading) return <div>Loading payments...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

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
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[var(--primary)]">₹{payment.amount}</div>
                  <span className={`text-sm px-3 py-1 rounded-full ${payment.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {payments.length === 0 && (
        <Card>
          <div className="p-12 text-center theme-muted">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payments found</p>
          </div>
        </Card>
      )}
    </div>
  );
}
