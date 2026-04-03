"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useAuth } from "@/context/AuthContext";
import { getVendorReviews } from "@/app/lib/vendorApi";
import { useToast } from "@/context/ToastContext";

type VendorReview = {
  _id: string;
  rating: number;
  comment: string;
  reply?: string;
};

export default function Ratings() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [vendorId, setVendorId] = useState<string>("");
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string>("");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const run = async () => {
      if (!profile?.uid) return;
      setError("");

      try {
        const reviewResponse = await getVendorReviews();
        const vendorResponse = await apiFetch(`/vendors/me`);
        if ((vendorResponse as any)?._id) {
          setVendorId(String((vendorResponse as any)._id));
        }
        setReviews(Array.isArray(reviewResponse) ? reviewResponse : []);
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Failed to fetch reviews.";
        setError(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [profile?.uid, refreshKey]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length;
  }, [reviews]);

  const distribution = useMemo(() => {
    const buckets: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      const rating = Number(review.rating || 0);
      if (rating >= 1 && rating <= 5) buckets[rating] += 1;
    });
    return buckets;
  }, [reviews]);

  const handleReply = async (reviewId: string) => {
    const text = replyText[reviewId]?.trim();
    if (!text || !profile?.uid) return;
    setSending(reviewId);
    setError("");

    const response = await apiFetch("/reviews/reply", {
      method: "POST",
      body: JSON.stringify({
        reviewId,
        actorUserId: profile.uid,
        reply: text,
      }),
    });

    if ((response as any)?.error) {
      setError((response as any).message || "Reply failed.");
      setSending("");
      return;
    }

    setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
    setLoading(true);
    setRefreshKey((prev) => prev + 1);
    setSending("");
  };

  if (loading) return <PageCardSkeleton count={3} className="md:grid-cols-1" />;
  if (error) {
    return (
      <ErrorState
        title="We couldn't load ratings."
        description={error}
        onRetry={() => setRefreshKey((prev) => prev + 1)}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        Reputation Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="theme-card mb-4 p-6">
            <h2 className="text-4xl font-bold theme-primary">
              {averageRating.toFixed(1)}
            </h2>

            <p className="theme-muted">
              Average Rating ({reviews.length})
            </p>
          </div>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <EmptyState
                title="No reviews yet"
                description="Reviews will appear here once customers complete their events."
              />
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="theme-card p-6">
                  <h3 className="font-medium">
                    Rating: {review.rating} ★
                  </h3>

                  <p className="theme-muted text-sm">
                    {review.comment}
                  </p>

                  {review.reply ? (
                    <p className="text-sm mt-2 text-green-700">Reply: {review.reply}</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <input
                        value={replyText[review._id] || ""}
                        onChange={(e) => setReplyText((prev) => ({ ...prev, [review._id]: e.target.value }))}
                        placeholder="Write a reply"
                        className="w-full border rounded-md p-2 text-sm"
                      />
                      <button
                        onClick={() => void handleReply(review._id)}
                        disabled={sending === review._id}
                        className="border px-3 py-1 rounded text-sm"
                      >
                        {sending === review._id ? "Sending..." : "Reply"}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="theme-card p-6">
          <h3 className="font-semibold mb-4">
            Rating Distribution
          </h3>

          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const percentage = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <p key={star}>
                {star} ★ {percentage}%
              </p>
            );
          })}

          <p className="text-xs text-gray-500 mt-3">
            Vendor ID: {vendorId || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
