"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import Card from "@/components/ui/Card";
import { Calendar, DollarSign } from "lucide-react";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      const res = await apiFetch("/admin/bookings");
      if (res?.error) {
        setError(res.message);
      } else {
        setBookings(Array.isArray(res) ? res : []);
      }
      setLoading(false);
    };
    loadBookings();
  }, []);

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

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
        <Card>
          <div className="p-12 text-center theme-muted">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No bookings found</p>
          </div>
        </Card>
      )}
    </div>
  );
}
