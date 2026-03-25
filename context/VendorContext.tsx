"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { useAuth } from "@/context/AuthContext"
import { getVendorDashboard, getVendorMe, updateVendorMe } from "@/app/lib/vendorApi"

type VendorContextValue = {
vendorProfile: Record<string, unknown> | null
dashboard: Record<string, unknown> | null
loadingProfile: boolean
loadingDashboard: boolean
refreshVendorProfile: () => Promise<void>
refreshDashboard: () => Promise<void>
saveVendorProfile: (payload: Record<string, unknown>) => Promise<Record<string, unknown>>
}

const VendorContext = createContext<VendorContextValue | null>(null)

export const VendorProvider = ({ children }: { children: ReactNode }) => {
const { profile } = useAuth()

const [vendorProfile, setVendorProfile] = useState<Record<string, unknown> | null>(null)
const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null)
const [loadingProfile, setLoadingProfile] = useState(false)
const [loadingDashboard, setLoadingDashboard] = useState(false)

// ✅ FETCH PROFILE
const refreshVendorProfile = useCallback(async () => {
console.log("VENDOR REFRESH CHECK - profile:", profile?.role)
if (!profile?.uid || profile.role !== "vendor") {
setVendorProfile(null)
return
}


setLoadingProfile(true)

try {
  const response = await getVendorMe()

  console.log("PROFILE RESPONSE:", response)

  if (response && typeof response === "object" && !response.error) {
    setVendorProfile(response)
  } else {
    console.warn("⚠️ Invalid profile response")
    setVendorProfile(null)
  }
} catch (err) {
  console.error("🔥 Profile fetch failed:", err)
  setVendorProfile(null)
}

setLoadingProfile(false)

}, [profile?.uid, profile?.role])

// ✅ FETCH DASHBOARD
const refreshDashboard = useCallback(async () => {
if (!profile?.uid || profile.role !== "vendor") {
setDashboard(null)
return
}


setLoadingDashboard(true)

try {
  const response = await getVendorDashboard()

  console.log("DASHBOARD RESPONSE:", response)

  if (response && typeof response === "object" && !response.error) {
    setDashboard(response)
  } else {
    console.warn("⚠️ Invalid dashboard response, using fallback")

    setDashboard({
      totalBookings: 0,
      pendingRequests: 0,
      pendingBookings: 0,
      completedBookings: 0,
      monthlyRevenue: 0,
      revenue: 0,
      rating: 0,
    })
  }
} catch (err) {
  console.error("🔥 Dashboard fetch failed:", err)

  setDashboard({
    totalBookings: 0,
    pendingRequests: 0,
    pendingBookings: 0,
    completedBookings: 0,
    monthlyRevenue: 0,
    revenue: 0,
    rating: 0,
  })
}

setLoadingDashboard(false)


}, [profile?.uid, profile?.role])

// ✅ SAVE PROFILE
const saveVendorProfile = useCallback(
async (payload: Record<string, unknown>) => {
if (!profile?.uid) return { error: true, message: "userId missing" }


  try {
    const response = await updateVendorMe(payload)

    console.log("SAVE RESPONSE:", response)

    if (response && typeof response === "object" && !response.error) {
      setVendorProfile(response)
    }

    return response
  } catch (err) {
    console.error("🔥 Save failed:", err)
    return { error: true }
  }
},
[profile?.uid],


)

// ✅ INITIAL LOAD
useEffect(() => {
if (profile?.role === "vendor") {
void refreshVendorProfile()
void refreshDashboard()
}
}, [profile?.role, refreshVendorProfile, refreshDashboard])

return (
<VendorContext.Provider
value={{
vendorProfile,
dashboard,
loadingProfile,
loadingDashboard,
refreshVendorProfile,
refreshDashboard,
saveVendorProfile,
}}
>
{children}
</VendorContext.Provider>
)
}

// ✅ HOOK
export const useVendorData = () => {
const context = useContext(VendorContext)

if (!context) {
throw new Error("useVendorData must be used within VendorProvider")
}

return context
}
