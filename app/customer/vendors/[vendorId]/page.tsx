"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useParams } from "next/navigation"
import { apiFetch, API_URL } from "@/app/lib/api"

const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, "")
const resolveAssetUrl = (path?: string) => {
  if (!path) return "/placeholder-avatar.jpg"
  if (path.startsWith("http")) return path
  return `${BACKEND_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`
}
import { useEffect, useState } from "react"
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState"
import { useEvent } from "@/context/EventContext"
import { useToast } from "@/context/ToastContext"

export default function VendorDetailPage() {
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

  const { currentEvent, getRequestForVendor, refreshData } = useEvent()
  const { showToast } = useToast()
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [error, setError] = useState("")
  const [selectedPackage, setSelectedPackage] = useState<any>(null)

  const existingRequest = currentEvent?.id && vendor?._id
    ? getRequestForVendor(currentEvent.id, String(vendor._id))
    : undefined

  const handleSendRequest = async () => {
    if (!currentEvent?.id) {
      showToast("Please create/select an event first before contacting vendors.", "error");
      return;
    }

    setRequesting(true);
    try {
      const packageAmount = selectedPackage?.price ?? 0;
      const packageName = selectedPackage?.name ?? "";

      const response = await apiFetch("/requests", {
        method: "POST",
        body: JSON.stringify({
          vendorId: String(vendor._id),
          eventId: currentEvent.id,
          amount: packageAmount,
          packageName,
        }),
      }) as any;

      if (response?._id || response?.id) {
        showToast(
          selectedPackage
            ? `Request sent with package: ${selectedPackage.name} (₹${Number(selectedPackage.price).toLocaleString("en-IN")})`
            : "Request sent successfully.",
          "success"
        );
        await refreshData();
      } else {
        showToast("Could not send vendor request.", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Could not send vendor request.", "error");
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

        // Auto-select: prefer first package with a price, else first with any name
        const allPkgs = ((data as any)?.packages ?? []).filter((p: any) => p?.name)
        const pricedPkg = allPkgs.find((p: any) => Number(p?.price) > 0)
        if (pricedPkg) setSelectedPackage(pricedPkg)
        else if (allPkgs.length > 0) setSelectedPackage(allPkgs[0])
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
              src={resolveAssetUrl(vendor.profileImage)}
              alt={vendor.name}
              className="h-full w-full rounded-t-xl object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-avatar.jpg" }}
            />
          </div>
        )}
        {vendor.portfolio && vendor.portfolio.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 mb-8 p-8">
            {vendor.portfolio.map((img: any, index: number) => (
              <img
                key={index}
                src={resolveAssetUrl(img.url || img)}
                alt={`${vendor.name} portfolio ${index + 1}`}
                className="h-48 w-full rounded-xl object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-avatar.jpg" }}
              />
            ))}
          </div>
        ) : (
          <div className="h-40 rounded-xl bg-gray-100 flex items-center justify-center mb-4 p-4 mx-8 mt-6">
            <p className="text-gray-400 text-sm">No portfolio images uploaded yet</p>
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

            {/* Packages — show all entries that have a name */}
            {vendor.packages?.filter((p: any) => p?.name).length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Service Packages</h2>
                <p className="theme-muted text-sm mb-4">Select a package before sending a request.</p>
                <div className="space-y-3">
                  {vendor.packages.filter((p: any) => p?.name).map((pkg: any, index: number) => {
                    const isSelected = selectedPackage?.name === pkg.name && selectedPackage?.price === pkg.price;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedPackage(pkg)}
                        className={`w-full text-left theme-card p-4 border-2 transition-all ${isSelected
                            ? "border-[var(--primary)] bg-[var(--primary)]/5"
                            : "border-transparent hover:border-gray-300"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${isSelected ? "border-[var(--primary)] bg-[var(--primary)]" : "border-gray-300"
                              }`} />
                            <div>
                              <p className="font-semibold">{pkg.name}</p>
                              {pkg.description && <p className="text-sm theme-muted mt-1">{pkg.description}</p>}
                              {pkg.servicesIncluded && (
                                <div className="mt-2">
                                  <p className="text-xs theme-muted">Includes:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {(Array.isArray(pkg.servicesIncluded)
                                      ? pkg.servicesIncluded
                                      : pkg.servicesIncluded.split(", ")
                                    ).map((service: string, sIndex: number) => (
                                      <span key={sIndex} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{service}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="theme-primary font-bold text-lg whitespace-nowrap ml-4">
                            {Number(pkg.price) > 0
                              ? `₹${Number(pkg.price).toLocaleString("en-IN")}`
                              : <span className="text-sm text-amber-600">Contact for pricing</span>}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
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
                        {Array.from({ length: Math.floor(review.rating || 0) }).map((_, i) => (
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

          {/* Sticky booking sidebar */}
          <div className="theme-surface rounded-3xl p-6 lg:sticky lg:top-8 lg:max-h-screen lg:overflow-y-auto space-y-4">
            {!currentEvent?.id && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">
                  Please <Link href="/customer/dashboard" className="font-medium underline">create or select an event</Link> first.
                </p>
              </div>
            )}

            {selectedPackage && (
              <div className="p-4 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl">
                <p className="text-xs theme-muted uppercase tracking-wide mb-1">Selected Package</p>
                <p className="font-semibold">{selectedPackage.name}</p>
                <p className="theme-primary font-bold text-xl mt-1">
                  {Number(selectedPackage.price) > 0
                    ? `₹${Number(selectedPackage.price).toLocaleString("en-IN")}`
                    : <span className="text-sm text-amber-600">Contact for pricing</span>}
                </p>
              </div>
            )}

            {!selectedPackage && vendor.packages?.filter((p: any) => p?.name).length > 0 && (
              <p className="text-sm text-amber-600">↑ Select a package above to book</p>
            )}

            <button
              type="button"
              onClick={handleSendRequest}
              disabled={
                requesting ||
                Boolean(existingRequest) ||
                !currentEvent?.id ||
                (vendor.packages?.filter((p: any) => p?.name).length > 0 && !selectedPackage)
              }
              className="w-full rounded-xl py-3 theme-button disabled:opacity-50"
            >
              {requesting
                ? "Sending..."
                : existingRequest
                  ? "Request Sent ✓"
                  : "Send Request"}
            </button>

            {existingRequest && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                <p className="text-sm text-green-700 font-medium">Request sent! Waiting for vendor response.</p>
                <p className="text-xs text-green-600 mt-1">You'll be notified when they accept.</p>
              </div>
            )}

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
