"use client"

import { useEffect, useState, useRef } from "react"
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
  const hasValidated = useRef(false)

  useEffect(() => {
    if (loading || hasValidated.current) return;

    hasValidated.current = true; // 🔥 lock immediately

    const validateVendorAccess = async () => {
      if (!profile) {
        setCheckingProfile(false);
        return;
      }

      if (profile.role !== "vendor") {
        router.replace(getDashboardPathForRole(profile.role));
        return;
      }

      try {
        const response = await getVendorMe();

        if ((response as any)?.error) {
          setCheckingProfile(false);
          return;
        }

        if (
          (response as any)?.profileCompleted === false &&
          pathname !== "/vendor/businessProfile"
        ) {
          router.replace("/vendor/businessProfile");
          return;
        }

      } catch {
        setCheckingProfile(false);
        return;
      }

      setCheckingProfile(false);
    };

    void validateVendorAccess();
  }, [loading]);

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
