"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { apiFetch, API_URL } from "@/app/lib/api"

// Static files (uploads) are served at the backend origin, NOT under /api
const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, "")
import { EmptyState, ErrorState, PageCardSkeleton, PageIntroSkeleton } from "@/components/ui/PageState"
import { useToast } from "@/context/ToastContext"
import { useEvent } from "@/context/EventContext"

type VendorListItem = {
  _id: string
  name: string
  businessName?: string
  category: string
  price?: number
  image?: string
  responseTime?: string
  rating?: number
}

function VendorsPageContent() {
  const { showToast } = useToast()
  const { currentEvent, sendVendorRequest, getRequestForVendor } = useEvent()
  const searchParams = useSearchParams()
  const serviceFilter = searchParams.get("service")?.toLowerCase().trim() || ""
  const [vendors, setVendors] = useState<VendorListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [requestingVendorId, setRequestingVendorId] = useState<string | null>(null)

  const resolveVendorImage = (imagePath?: string): string => {
    if (!imagePath || imagePath === "") return "/placeholder-avatar.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${BACKEND_ORIGIN}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const handleSendRequest = async (vendorId: string) => {
    if (!currentEvent?.id) {
      showToast("Please create or select an event first.", "error")
      return
    }
    setRequestingVendorId(vendorId)
    try {
      await sendVendorRequest(currentEvent.id, vendorId)
      showToast("Request sent!", "success")
    } catch {
      showToast("Could not send request.", "error")
    } finally {
      setRequestingVendorId(null)
    }
  }

  const loadVendors = async () => {
    setLoading(true)
    setError("")

    try {
      const data = await apiFetch("/vendors")
      const processedVendors = Array.isArray(data) ? data.map(v => {
        console.log("🔍 Raw vendor data:", v); // DEBUG: Check actual fields
        return {
          ...v,
          name: v.businessName || v.name || 'Unnamed Vendor',
          price: (v as any).price,
          image: resolveVendorImage(v.profileImage || v.image || v.avatar)
        }
      }) : [];
      console.log("🖼️ Processed vendors with images:", processedVendors); // DEBUG
      setVendors(processedVendors)
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Could not load vendors."
      setError(message)
      showToast(message, "error")
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadVendors()
  }, [])

  const filteredVendors = serviceFilter
    ? vendors.filter((vendor) => vendor.category.toLowerCase().includes(serviceFilter))
    : vendors

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="theme-primary mb-2 text-sm font-semibold uppercase tracking-[0.2em]">
          Vendor Discovery
        </p>
        <h1 className="text-4xl font-bold mb-3">
          Discover Vendors
        </h1>
        <p className="theme-muted text-lg">
          Browse all available vendors for your event needs.
        </p>
        <p>Total vendors: {filteredVendors.length}</p>
      </div>

      {loading ? (
        <div className="space-y-8">
          <PageIntroSkeleton />
          <PageCardSkeleton />
        </div>
      ) : error ? (
        <ErrorState
          title="We couldn't load vendors."
          description="Retry to fetch live vendor availability and service matches."
          onRetry={() => void loadVendors()}
          retryLabel="Retry"
        />
      ) : filteredVendors.length === 0 ? (
        <EmptyState
          title={serviceFilter ? "No vendors found" : "No vendors available yet"}
          description={
            serviceFilter
              ? "No vendors found. Try another service or clear your filter to explore more options."
              : "No vendors yet? They'll appear here once they complete their profiles! 👇"
          }
          secondaryAction={
            serviceFilter ? undefined : (
              <Link href="/login?role=vendor" className="theme-primary font-medium underline">
                Become a Vendor
              </Link>
            )
          }
          actionLabel={serviceFilter ? "Browse All Vendors" : "Refresh Vendors"}
          actionHref={serviceFilter ? "/customer/vendors" : undefined}
        />
      ) : (
      <div className="grid gap-8 md:grid-cols-3">
        {filteredVendors.map((vendor, index) => (
          <motion.div
            key={vendor._id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            className="theme-card overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg"
          >
            <div className="relative h-44">
              <img
                src={vendor.image || "/placeholder-avatar.jpg"}
                alt={`${vendor.name} - ${vendor.category}`}
                className="h-full w-full rounded-t-xl object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-avatar.jpg";
                  console.log("❌ Image failed to load for vendor:", vendor.name);
                }}
              />
            </div>

            <div className="p-4 space-y-2">
              <h3 className="font-semibold">{vendor.name}</h3>
              <p className="theme-muted text-sm">{vendor.category}</p>
              {vendor.responseTime && (
                <p className="theme-muted text-xs">{vendor.responseTime}</p>
              )}
              {vendor.price && (
                <span className="theme-primary font-bold">
                  ₹{Number(vendor.price).toLocaleString("en-IN")}
                </span>
              )}
              {vendor.rating && (
                <p className="text-sm text-gray-500">⭐ {vendor.rating}</p>
              )}

              <div className="mt-4 flex flex-col gap-2">
                {(() => {
                  const existingRequest = currentEvent?.id
                    ? getRequestForVendor(currentEvent.id, vendor._id)
                    : undefined
                  const isSending = requestingVendorId === vendor._id
                  return (
                    <button
                      type="button"
                      onClick={() => void handleSendRequest(vendor._id)}
                      disabled={isSending || Boolean(existingRequest)}
                      className="w-full rounded-xl px-4 py-2 text-sm font-medium theme-button disabled:opacity-60 transition-all duration-200"
                    >
                      {isSending ? "Sending..." : existingRequest ? "Request Sent" : "Send Request"}
                    </button>
                  )
                })()}
                <Link
                  href={`/customer/vendors/${vendor._id}`}
                  className="block w-full rounded-xl border px-4 py-2 text-center text-sm transition-all duration-300 ease-in-out hover:opacity-90"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  )
}

export default function VendorsPage() {
  return (
    <Suspense fallback={<PageCardSkeleton />}>
      <VendorsPageContent />
    </Suspense>
  )
}
