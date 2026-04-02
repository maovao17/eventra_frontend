"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import VendorSidebar from "@/components/vendor/VendorSidebar copy"
import VendorTopbar from "@/components/vendor/VendorTopbar copy"
import { useAuth } from "@/context/AuthContext"
import { getVendorMe } from "@/app/lib/vendorApi"
import { ProtectedLayoutLoading } from "@/components/ui/PageState"
import { getDashboardPathForRole } from "@/lib/routes"

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { profile, loading } = useAuth()
  const [checkingProfile, setCheckingProfile] = useState(true)

  useEffect(() => {
    const validateVendorAccess = async () => {
      if (loading) return

      if (!profile) {
        router.replace("/login")
        return
      }

      if (profile.role !== "vendor") {
        router.replace(getDashboardPathForRole(profile.role))
        return
      }

      const response = await getVendorMe()
      if (response?.error) {
        setCheckingProfile(false)
        return
      }
      if (!response?.error && response?.profileCompleted === false && pathname !== "/vendor/businessProfile") {
        router.replace("/vendor/businessProfile")
        return
      }

      setCheckingProfile(false)
    }

    void validateVendorAccess()
  }, [loading, pathname, profile, router])

  if (loading || checkingProfile) {
    return (
      <ProtectedLayoutLoading
        title="Preparing your vendor workspace"
        subtitle="We're checking access, profile completion, and your latest bookings."
      />
    )
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
