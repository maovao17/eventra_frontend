"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useParams } from "next/navigation"
import { apiFetch } from "@/app/lib/api"
import { useEffect, useState } from "react"
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState"
import { useEvent } from "@/context/EventContext"
import { useToast } from "@/context/ToastContext"

export default function VendorDetailPage({ params }: { params: { vendorId: string } }) {
  const { vendorId } = useParams();
  if (!vendorId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Invalid vendor</h1>
          <Link href="/customer/vendors" className="theme-button">
            Browse Vendors
          </Link>
        </div>
      </div>
    );
  }

  const { currentEvent, sendVendorRequest, getRequestForVendor } = useEvent()
  const { showToast } = useToast()
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [error, setError] = useState("")
const existingRequest = currentEvent?.id && vendor?._id
    ? getRequestForVendor(currentEvent.id, String(vendor._id))
    : undefined

  const handleSendRequest = async () => {
    console.log("BUTTON CLICKED");
    console.log("Event ID:", currentEvent?.id);
    console.log("Vendor ID:", vendor?._id);

    if (!currentEvent?.id) {
      showToast("Please create/select an event first before contacting vendors.", "error");
      return;
    }

    setRequesting(true);
    try {
      const request = await sendVendorRequest(currentEvent.id, String(vendor._id));
      console.log("SUCCESS:", request);
      if (request) {
        showToast("Request sent successfully.", "success");
      } else {
        showToast("Could not send vendor request.", "error");
      }
    } catch (err) {
      console.error("ERROR:", err);
      showToast("Could not send vendor request.", "error");
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    const loadVendor = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(`/vendors/${vendorId}`)
        setVendor(data ?? null)
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Vendor not found"
        setError(message)
        setVendor(null)
        showToast(message, "error")
      } finally {
        setLoading(false)
      }
    }
    void loadVendor()
  }, [vendorId])

  useEffect(() => {
    const loadReviews = async () => {
      setReviewsLoading(true)
      try {
        const data = await apiFetch(`/reviews?vendorId=${vendorId}`)
        setReviews(Array.isArray(data) ? data : [])
      } catch {
        setReviews([])
      } finally {
        setReviewsLoading(false)
      }
    }
    loadReviews()
  }, [vendorId])

  if (loading) {
    return <PageCardSkeleton />
  }

  if (error) {
    return (
      <ErrorState
        title="We couldn't load this vendor."
        description={error}
        onRetry={() => window.location.reload()}
        retryLabel="Retry"
      />
    )
  }

  if (!vendor) {
    return (
      <EmptyState
        title="No vendors found"
        description="This vendor profile is unavailable. Try another service or browse the full directory."
        actionLabel="Browse Vendors"
        actionHref="/customer/vendors"
      />
    )
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="theme-card overflow-hidden"
      >
        {vendor.profileImage && (
          <div className="relative h-64">
            <img
              src={vendor.profileImage || '/default-avatar.png'}
              alt={vendor.name}
              className="h-full w-full rounded-t-xl object-cover"
            />
          </div>
        )}
        {vendor.portfolio && vendor.portfolio.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 mb-8 p-8">
            {vendor.portfolio.map((img: any, index: number) => (
              <img
                key={index}
                src={img.url || img || '/eventra_photos/default-vendor.jpg'}
                alt={`${vendor.name} portfolio ${index + 1}`}
                className="h-48 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="h-64 rounded-xl bg-gray-200 flex items-center justify-center mb-8 p-8">
            No portfolio images
          </div>
        )}

        <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.4fr]">
          <div>
            <div className="flex items-center mb-4">
              <h1 className="text-4xl font-bold">{vendor.businessName || vendor.name}</h1>
              {vendor.isVerified && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✔ Verified
                </span>
              )}
            </div>
            {vendor.description && (
              <p className="theme-muted mt-4 max-w-2xl text-lg">{vendor.description}</p>
            )}

            {vendor.packages && vendor.packages.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Service Packages</h2>
                <ul className="space-y-2">
                  {vendor.packages.map((pkg: any, index: number) => (
                    <li key={index} className="theme-card p-4">
                      <div className="font-semibold">{pkg.name}</div>
                      <div className="text-sm theme-muted">₹{pkg.price?.toLocaleString('en-IN') || pkg.price}</div>
{pkg.description && <p className="mt-2 text-sm">{pkg.description}</p>}
                      {pkg.servicesIncluded && (
                        <div className="mt-2">
                          <p className="text-xs theme-muted">Services:</p>
                          <ul className="list-disc list-inside mt-1 text-xs">
                            {Array.isArray(pkg.servicesIncluded) ? pkg.servicesIncluded.map((service: string, sIndex: number) => (
                              <li key={sIndex}>{service}</li>
                            )) : pkg.servicesIncluded.split(', ').map((service: string, sIndex: number) => (
                              <li key={sIndex}>{service}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {vendor.location && (
              <div className="mt-8 theme-card p-6">
                <h2 className="text-xl font-semibold mb-4">Location</h2>
                <p>{vendor.location.address || vendor.location.city}</p>
              </div>
            )}

            {vendor.rating && (
              <div className="mt-4">
                <p className="text-2xl font-bold">⭐ {vendor.rating}</p>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
              {reviewsLoading ? (
                <PageCardSkeleton count={2} className="md:grid-cols-1" />
              ) : reviews.length === 0 ? (
                <EmptyState
                  title="No reviews yet"
                  description="No reviews yet. Be the first to book this vendor and leave feedback."
                />
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: any, index: number) => (
                    <div key={index} className="theme-card p-4">
                      <div className="flex items-center mb-2">
                        {Array.from({length: Math.floor(review.rating || 0)}).map((_, i) => (
                          <span key={i} className="text-yellow-400">⭐</span>
                        ))}
                        <span className="ml-2 text-sm theme-muted">({review.rating}/5)</span>
                      </div>
                      <p>{review.comment || 'No comment'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="theme-surface rounded-3xl p-6 lg:sticky lg:top-8 lg:max-h-screen lg:overflow-y-auto">
            {!currentEvent?.id && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">
                  Please <Link href="/customer/dashboard" className="font-medium underline">create or select an event</Link> first to send vendor requests.
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={handleSendRequest}
              disabled={requesting || Boolean(existingRequest) || !currentEvent?.id}
              className="w-full rounded-xl py-3 theme-button disabled:opacity-50 mb-4"
            >
              {requesting ? "Sending..." : existingRequest ? "Request Sent" : "Send Request"}
            </button>
            <Link 
              href="/customer/vendors" 
              className="block w-full rounded-xl border px-4 py-3 text-center text-sm"
            >
              ← Back to Vendors
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
