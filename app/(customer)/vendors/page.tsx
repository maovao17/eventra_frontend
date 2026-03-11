"use client"

import VendorCard from "@/components/customer/VendorCard";
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation";
import { useEvent } from "@/context/EventContext";
import { Suspense } from "react";

function VendorsContent() {
  const searchParams = useSearchParams()
  const { vendors, currentEvent, sendVendorRequest, getRequestForVendor } = useEvent()
  const activeService = searchParams.get("service")
  const filteredVendors = activeService
    ? vendors.filter((vendor) =>
        vendor.category.toLowerCase().includes(activeService.toLowerCase())
      )
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
          Compare categories, response speed, and starting quotes before
          sending requests and opening vendor conversations.
        </p>
        {activeService ? (
          <p className="theme-primary mt-3 text-sm font-medium">
            Filtered by service: {activeService}
          </p>
        ) : null}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {filteredVendors.map((vendor, index) => (
          <motion.div
            key={vendor.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
          >
            <VendorCard
              vendor={vendor}
              requested={
                currentEvent
                  ? Boolean(getRequestForVendor(currentEvent.id, vendor.id))
                  : false
              }
              onRequest={() => {
                if (!currentEvent) return
                sendVendorRequest(currentEvent.id, vendor.id)
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function VendorsPage() {
  return (
    <Suspense fallback={<div className="theme-card p-6">Loading vendors...</div>}>
      <VendorsContent />
    </Suspense>
  )
}
