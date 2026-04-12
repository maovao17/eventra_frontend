"use client";

import Link from "next/link";
import { useVendorData } from "@/context/VendorContext";

export default function UpcomingEventsTable() {
  const { dashboard } = useVendorData();
  const events: any[] = dashboard?.upcomingEvents ?? [];

  return (
    <div className="theme-card p-6 mt-6">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-lg font-semibold">Upcoming Events</h2>
        <Link href="/vendor/events" className="theme-primary text-sm hover:underline">
          View All
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="theme-muted text-sm py-4 text-center">
          No upcoming events yet. Accepted bookings will appear here.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b theme-muted">
            <tr>
              <th className="py-3 text-left">Event</th>
              <th className="py-3 text-left">Date</th>
              <th className="py-3 text-left">Location</th>
              <th className="py-3 text-left">Guests</th>
              <th className="py-3 text-left">Amount</th>
              <th className="py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{event.eventType || "Event"}</td>
                <td className="py-3 theme-muted">{event.date || "—"}</td>
                <td className="py-3 theme-muted">{event.location || "—"}</td>
                <td className="py-3 theme-muted">{event.guests || 0}</td>
                <td className="py-3">₹{Number(event.amount || 0).toLocaleString("en-IN")}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {event.status === "confirmed" ? "Confirmed" : "Awaiting Payment"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
