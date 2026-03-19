"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { notFound, useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useEvent } from "@/context/EventContext"

export default function VendorProfilePage() {
  const params = useParams<{ vendorId: string }>()
  const router = useRouter()
  const { vendors, currentEvent, sendVendorRequest, getRequestForVendor, formatCurrency } = useEvent()
  const vendor = vendors.find((item) => item.id === params.vendorId)

  if (!vendor) {
    notFound()
  }

  const request =
    currentEvent ? getRequestForVendor(currentEvent.id, vendor.id) : undefined

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="theme-card overflow-hidden"
      >
        <div className="relative h-64">
          <Image
            src={vendor.image}
            alt={vendor.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.4fr]">
          <div>
            <span className="theme-pill px-3 py-1 text-xs font-semibold">
              {vendor.category}
            </span>
            <h1 className="mt-4 text-4xl font-bold">{vendor.name}</h1>
            <p className="theme-muted mt-4 max-w-2xl">
              {vendor.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {vendor.services.map((service) => (
                <span key={service} className="theme-surface rounded-full px-4 py-2 text-sm">
                  {service}
                </span>
              ))}
            </div>
          </div>

          <div className="theme-surface rounded-3xl p-6">
            <p className="theme-muted text-sm">Starting Price</p>
            <p className="mt-3 text-3xl font-bold">{formatCurrency(vendor.price)}</p>
            <p className="theme-muted mt-4 text-sm">{vendor.location}</p>
            <p className="theme-muted mt-2 text-sm">⭐ {vendor.rating} rating</p>
            <p className="theme-muted mt-2 text-sm">{vendor.responseTime}</p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => {
                  if (!currentEvent) return
                  sendVendorRequest(currentEvent.id, vendor.id)
                  router.push("/checkout")
                }}
                className={`w-full rounded-xl py-3 ${
                  request ? "bg-[var(--primary-light)] text-[var(--primary)]" : "theme-button"
                }`}
              >
                {request ? "Request Sent" : "Send Request"}
              </button>

              <Link href={`/vendors?service=${encodeURIComponent(vendor.category)}`} className="block rounded-xl border px-4 py-3 text-center text-sm">
                Explore Similar Vendors
              </Link>

              {request ? (
                <button
                  type="button"
                  onClick={() => router.push("/messages")}
                  className="block w-full rounded-xl border px-4 py-3 text-center text-sm"
                >
                  Open Chat
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
