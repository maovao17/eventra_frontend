"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VendorDashboardCompatibilityPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/vendor/dashboard")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );

  return null
}
