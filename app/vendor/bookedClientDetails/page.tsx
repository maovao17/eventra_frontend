"use client";

import { MapPin } from "lucide-react";
import { ChangeEvent, Fragment, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useVendorData } from "@/context/VendorContext";
import { initializeChatThread } from "@/lib/chat";

type BookingDetails = {
  _id: string;
  requestId: string;
  eventId: string;
  customerId: string;
  status: string;
  date?: string;
  time?: string;
  location?: string;
  guests?: number;
  price?: number;
  amount?: number;
  payoutStatus?: "pending" | "paid";
  completionImages?: string[];
};

type EventDetails = {
  eventType?: string;
  name?: string;
  eventDate?: string;
  guestCount?: number;
  location?: { label?: string };
  budget?: number;
};

type ClientDetails = {
  name?: string;
  phoneNumber?: string;
};

function BookingDetailsPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { updateBookingStatus } = useVendorData();
  const bookingId = params.get("bookingId");
  const requestId = params.get("requestId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [client, setClient] = useState<ClientDetails | null>(null);

  const fetchDetails = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    setError("");

    let resolvedBooking: BookingDetails | null = null;

    try {
      if (bookingId) {
        resolvedBooking = (await apiFetch(`/bookings/${bookingId}`)) as BookingDetails;
      } else if (requestId) {
        const allBookings = await apiFetch(`/bookings`);
        resolvedBooking = Array.isArray(allBookings)
          ? (allBookings.find((item: BookingDetails) => String(item.requestId) === String(requestId)) as BookingDetails)
          : null;
        if (!resolvedBooking) {
          setError("Booking is not created yet for this request.");
          setLoading(false);
          return;
        }
      } else {
        setError("Booking ID is missing.");
        setLoading(false);
        return;
      }

      if (!resolvedBooking) {
        setError("Booking details not found.");
        setLoading(false);
        return;
      }

      setBooking(resolvedBooking);

      const requestResponse = await apiFetch(`/requests`);
      if (Array.isArray(requestResponse)) {
        const matchingRequest = requestResponse.find(
          (item: { _id?: string }) => String(item?._id) === String(resolvedBooking?.requestId),
        ) as {
          event?: EventDetails;
          customer?: ClientDetails;
        } | undefined;

        if (matchingRequest?.event) setEvent(matchingRequest.event);
        if (matchingRequest?.customer) setClient(matchingRequest.customer);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Could not load booking details.")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDetails();
  }, [profile?.uid, bookingId, requestId]);

  const handleUploadProof = async (eventInput: ChangeEvent<HTMLInputElement>) => {
    if (!booking?._id || !eventInput.target.files?.[0] || !profile?.uid) return;
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", eventInput.target.files[0]);
      formData.append("actorUserId", profile.uid);

      const response = await apiFetch(`/bookings/${booking._id}/upload-proof`, {
        method: "POST",
        body: formData,
      });
      setSuccess("Completion proof uploaded! Booking auto-marked complete.");
      setBooking(response as BookingDetails);
      // Auto-mark complete after upload success
      await apiFetch(`/bookings/${booking._id}/complete`, {
        method: "PATCH",
        body: JSON.stringify({ actorUserId: profile.uid }),
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const markCompleted = async () => {
    if (!booking?._id || !profile?.uid) return;
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch(`/bookings/${booking._id}/complete`, {
        method: "PATCH",
        body: JSON.stringify({
          actorUserId: profile.uid,
        }),
      });

      setSuccess("Booking marked as completed.");
      showToast("Booking marked as completed.", "success");
      setBooking(response as BookingDetails);
    } catch (completionError) {
      setError(
        completionError instanceof Error
          ? completionError.message
          : "Could not mark booking completed.",
      );
    }
  };

  const handleAccept = async () => {
    if (!booking?._id || !profile?.uid || !booking.requestId) return;
    setError("");
    setSuccess("");

    const success = await updateBookingStatus(booking._id, "accepted");
    if (!success) {
      setError("Could not accept booking.");
      return;
    }

    // Create chat
    await initializeChatThread({
      bookingId: booking._id,
    });

    setSuccess("Booking accepted and chat created!");
    showToast("Booking accepted and chat created.", "success");
    await fetchDetails(); // refresh
  };

  const handleReject = async () => {
    if (!booking?._id || !profile?.uid) return;
    setError("");
    setSuccess("");

    const success = await updateBookingStatus(booking._id, "rejected");
    if (!success) {
      setError("Could not reject booking.");
      return;
    }

    setSuccess("Booking rejected.");
    showToast("Booking rejected.", "success");
    await fetchDetails(); // refresh
  };

  const statusLabel = useMemo(() => {
    const status = booking?.status;
    const payoutStatus = booking?.payoutStatus ?? "pending";

    if (status === "accepted") {
      return "Awaiting Payment";
    }
    if (status === "completed" && payoutStatus !== "paid") {
      return "Awaiting Payout";
    }
    if (status === "completed" && payoutStatus === "paid") {
      return "Paid";
    }

    if (!status) return "Pending booking";
    return `${String(status).charAt(0).toUpperCase()}${String(status).slice(1)} booking`;
  }, [booking?.status, booking?.payoutStatus]);

  if (loading) return <PageCardSkeleton count={3} className="md:grid-cols-1" />;
  if (error) {
    return (
      <ErrorState
        title="We couldn't load booking details."
        description={error}
        onRetry={() => void fetchDetails()}
        retryLabel="Retry"
      />
    );
  }
  if (!booking) {
    return (
      <EmptyState
        title="No booking selected"
        description="Open a booking request or event booking to view client details here."
        actionLabel="View Booking Requests"
        actionHref="/vendor/bookingRequest"
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <div>
          <h1 className="text-xl font-semibold">
            {client?.name || "Client"}
          </h1>

          <p className="text-sm text-gray-500">
            {statusLabel} • {event?.eventType || "Event"} • {event?.name || "Customer Event"}
          </p>
        </div>

        {success && <p className="text-green-600 text-sm">{success}</p>}

        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold mb-4">
            Event Logistics
          </h2>

          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Event Date</p>
              <p className="font-medium">{booking.date || event?.eventDate || "Date pending"}</p>
            </div>

            <div>
              <p className="text-gray-500">Time</p>
              <p className="font-medium">{booking.time || "Time pending"}</p>
            </div>

            <div>
              <p className="text-gray-500">Guest Count</p>
              <p className="font-medium">{booking.guests || event?.guestCount || 0} Expected</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} />
            {booking.location || event?.location?.label || "Location pending"}
          </div>

          <div className="mt-4 h-40 rounded-lg bg-gray-200 flex items-center justify-center">
            Map Preview
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold mb-4">
            Completion Proof
          </h2>
          <input type="file" accept="image/*" onChange={(e) => void handleUploadProof(e)} />
          {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
          {(booking.completionImages || []).length === 0 ? (
            <p className="text-sm text-gray-500 mt-3">No completion images yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {(booking.completionImages || []).map((image: string, index: number) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`Completion ${index + 1}`}
                  className="h-24 w-full object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold mb-4">
            Payment Overview
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Total Budget</span>
              <span>₹{Number(event?.budget || 0).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between">
              <span>Booking Amount</span>
              <span className="text-green-600">₹{Number(booking.price || booking.amount || 0).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between">
              <span>Status</span>
              <span className="text-orange-600">{booking.status}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold mb-4">
            Client Profile
          </h2>

          <p className="font-medium">{client?.name || "Unknown client"}</p>
          <p className="text-sm text-gray-500">{client?.phoneNumber || "Phone unavailable"}</p>
          <p className="text-sm text-gray-500">{event?.eventType || "Event"}</p>
        </div>

        <div className="bg-white border rounded-xl p-5 space-y-3">
          {['pending', 'accepted', 'confirmed'].includes(booking.status) && (
            <button
              onClick={() => router.push(`/vendor/messages?bookingId=${booking._id}`)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors"
            >
              Message Client
            </button>
          )}

          {booking.status === 'pending' && (
            <Fragment>
              <button
                onClick={() => void handleAccept()}
                className="w-full bg-green-500 text-white py-2 rounded-lg"
              >
                Accept
              </button>
              <button
                onClick={() => void handleReject()}
                className="w-full bg-gray-500 text-white py-2 rounded-lg"
              >
                Decline
              </button>
            </Fragment>
          )}


          {booking.status === 'accepted' && (
            <div className="w-full border py-2 rounded-lg text-center text-amber-600 font-medium">
              Awaiting customer payment
            </div>
          )}
          {booking.status === 'confirmed' && (
            <button
              onClick={() => void markCompleted()}
              className="w-full bg-blue-500 text-white py-2 rounded-lg"
            >
              Mark Completed
            </button>
          )}

          {booking.status === 'completed' && (
            <div className="w-full border py-2 rounded-lg text-center text-green-600 font-medium">
              Completed ✓
            </div>
          )}

          {booking.status === 'cancelled' && (
            <Fragment>
              <div className="w-full border py-2 rounded-lg text-center text-red-500 font-medium">
                Cancelled
              </div>
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingDetailsPage() {
  return (
    <Suspense fallback={<div className="theme-card p-8">Loading booking details...</div>}>
      <BookingDetailsPageContent />
    </Suspense>
  );
}
