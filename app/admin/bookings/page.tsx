"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/context/ToastContext";
import Card from "@/components/ui/Card";
import { Calendar, DollarSign } from "lucide-react";
import type { Booking } from "@/app/types/eventra";

export default function AdminBookings() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/admin/bookings");
      setBookings(Array.isArray(res) ? res : []);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Could not load bookings.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  if (loading) return <PageCardSkeleton count={4} className="md:grid-cols-1" />;
  if (error) {
    return (
      <ErrorState
        title="We couldn't load bookings."
        description="Retry to fetch platform booking activity."
        onRetry={() => void loadBookings()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Bookings List</h1>
      <p className="theme-muted mb-8">All event bookings across the platform.</p>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking._id}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">{booking.eventType || 'Event'}</h3>
                  <p className="theme-muted text-sm">{booking.status}</p>
                </div>
                <span className="text-2xl font-bold text-[var(--primary)]">₹{booking.amount}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm theme-muted">
                <div><Calendar className="inline mr-1 h-4 w-4" /> {new Date(booking.createdAt).toLocaleDateString()}</div>
                <div><DollarSign className="inline mr-1 h-4 w-4" /> Payment: {booking.paymentStatus || 'pending'}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {bookings.length === 0 && (
        <EmptyState
          title="No bookings found"
          description="Bookings will appear here after customers start confirming vendors."
          secondaryAction={
            <button
              type="button"
              onClick={() => void loadBookings()}
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
