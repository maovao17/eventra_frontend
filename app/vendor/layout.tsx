"use client"

import React, { useEffect, useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import VendorSidebar from "@/components/vendor/VendorSidebar copy"
import VendorTopbar from "@/components/vendor/VendorTopbar copy"
import { useAuth } from "@/context/AuthContext"
import { getVendorMe } from "@/app/lib/vendorApi"
import { ProtectedLayoutLoading } from "@/components/ui/PageState"
import { getDashboardPathForRole } from "@/lib/routes"

export default React.memo(function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { profile, loading } = useAuth()
  const hasValidated = useRef(false)

  useEffect(() => {
    if (loading) return;
    if (hasValidated.current) return;

    hasValidated.current = true; // 🔥 LOCK IMMEDIATELY

    const validateVendorAccess = async () => {
      if (!profile) return;

      if (profile.role !== "vendor") {
        router.replace(getDashboardPathForRole(profile.role));
        return;
      } 
      try {
        const response = await getVendorMe() as any;
        if (response?.profileCompleted === false) {
          router.replace("/vendor/businessProfile");
        }
      } catch (err) {
        console.warn("Vendor validation failed", err);
      }
    };

    void validateVendorAccess();
  }, [loading]); // ✅ ONLY loading

  if (loading) {
    return <ProtectedLayoutLoading
      title="Preparing your vendor workspace"
      subtitle="We're checking access, profile completion, and your latest bookings."
    />;
  }

  if (!profile) {
    return null; // prevents flicker render
  }

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <VendorSidebar />

      <div className="flex flex-col flex-1">
        <VendorTopbar />

        <main className="p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
)