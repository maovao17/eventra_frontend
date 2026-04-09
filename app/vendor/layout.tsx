"use client"

import React, { useEffect, useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import VendorSidebar from "@/components/vendor/VendorSidebar copy"
import VendorTopbar from "@/components/vendor/VendorTopbar copy"
import { useAuth } from "@/context/AuthContext"

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
  const hasMounted = useRef(false)

  useEffect(() => {
    if (loading) return;

    if (!profile) return;

    if (profile.role !== "vendor") {
      router.replace(getDashboardPathForRole(profile.role));
    }
  }, [loading]);

  if (!hasMounted.current) {
    if (loading || !profile) {
      return <ProtectedLayoutLoading title="Loading vendor dashboard" subtitle="One moment..." />;
    }

    hasMounted.current = true;
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