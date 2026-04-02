"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { apiFetch } from "@/app/lib/api"
import { useEffect, useState } from "react"
import { useEvent } from "@/context/EventContext"
import { useToast } from "@/context/ToastContext"

export default function VendorDetailPage({ params }: { params: { vendorId: string } }) {
  const { currentEvent, sendVendorRequest } = useEvent()
  const { showToast } = useToast()
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    const loadVendor = async () => {
      setLoading(true)
      const data = await apiFetch(`/vendors/${params.vendorId}`)
      setVendor(data?.error ? null : data)
      setLoading(false)
    }
    void loadVendor()
  }, [params.vendorId])

  useEffect(() => {
    const loadReviews = async () => {
      setReviewsLoading(true)
      try {
        const data = await apiFetch(`/reviews?vendorId=${params.vendorId}`)
        setReviews(Array.isArray(data) ? data : [])
      } catch {
        setReviews([])
      } finally {
        setReviewsLoading(false)
      }
    }
    loadReviews()
  }, [params.vendorId])

  if (loading) {
    return <p className="theme-muted text-lg">Loading vendor...</p>
  }

  if (!vendor) {
    return <p className="theme-muted text-lg">Vendor not found</p>
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="theme-card overflow-hidden"
      >
        {vendor.portfolio && vendor.portfolio.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 mb-8">
            {vendor.portfolio.map((img: string, index: number) => (
              <img
                key={index}
                src={img}
                alt={`${vendor.name} portfolio ${index + 1}`}
                className="h-48 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="h-64 rounded-xl bg-gray-200 flex items-center justify-center mb-8">
            No portfolio images
          </div>
        )}

        <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.4fr]">
          <div>
          <h1 className="text-4xl font-bold">{vendor.name}</h1>
          {vendor.description && (
            <p className="theme-muted mt-4 max-w-2xl text-lg">{vendor.description}</p>
          )}

          {vendor.services && vendor.services.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Services</h2>
              <ul className="space-y-2">
                {vendor.services.map((service: any, index: number) => (
                  <li key={index} className="theme-card p-4">
                    {service.name || service}
                  </li>
                ))}
              </ul>
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
              <p className="theme-muted">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="theme-muted">No reviews yet. Be the first to review!</p>
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

            <div className="theme-surface rounded-3xl p-6 lg:sticky lg:top-8 lg:max-h-screen lg:overflow-y-auto">
              <button
                type="button"
                onClick={async () => {
                  if (!currentEvent?.id) {
                    showToast("Create an event first before contacting vendors.", "error")
                    return
                  }

                  setRequesting(true)
                  try {
                    const request = await sendVendorRequest(currentEvent.id, String(vendor._id))
                    if (request) {
                      showToast("Request sent successfully.", "success")
                    } else {
                      showToast("Could not send vendor request.", "error")
                    }
                  } catch {
                    showToast("Could not send vendor request.", "error")
                  }
                  setRequesting(false)
                }}
                disabled={requesting}
                className="w-full rounded-xl py-3 theme-button disabled:opacity-50 mb-4"
              >
                {requesting ? "Sending..." : "Send Request"}
              </button>
              <Link 
                href="/customer/vendors" 
                className="block w-full rounded-xl border px-4 py-3 text-center text-sm"
              >
                ← Back to Vendors
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
