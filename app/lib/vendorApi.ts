import { apiFetch } from "@/app/lib/api"

export type VendorBookingStatus = "pending" | "accepted" | "rejected" | "completed"

export const getVendorMe = async () => {
  return apiFetch(`/vendors/me`)
}

export const saveVendorProfile = async (payload: Record<string, unknown>) => {
  console.log("Frontend saving payload:", payload);
  return apiFetch(`/vendors/profile`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
};

export const updateVendorMe = async (payload: Record<string, unknown>) => {saveVendorProfile(payload) 
  return apiFetch(`/vendors/profile`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
};

export const uploadVendorFile = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)

  return apiFetch("/vendors/upload", {
    method: "POST",
    body: formData,
  })
}

export const uploadVendorPortfolio = async (files: File[], caption?: string, category?: string) => {
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))
  if (caption) formData.append("caption", caption)
  if (category) formData.append("category", category)

  return apiFetch("/vendors/portfolio", {
    method: "POST",
    body: formData,
  })
}

export const uploadVendorPortfolioMultiple = async (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))

  return apiFetch("/vendors/upload-multiple", {
    method: "POST",
    body: formData,
  })
}

export const assignVendorServices = async (serviceIds: string[]) => {
  return apiFetch("/vendors/services", {
    method: "POST",
    body: JSON.stringify({ serviceIds }),
  })
}

export const updateVendorAvailability = async (
  payload: { blockedDates?: string[]; workingHours?: { start?: string; end?: string } },
) => {
  return apiFetch("/vendors/availability", {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export const getVendorBookings = async (vendorId?: string) => {
  const query = vendorId ? `?vendorId=${vendorId}` : ""
  return apiFetch(`/bookings${query}`)
}

export const updateVendorBookingStatus = async (
  bookingId: string,
  status: VendorBookingStatus,
): Promise<boolean> => {
  await apiFetch(`/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })

  return true
}

export const getVendorDashboard = async () => {
  return apiFetch(`/vendors/dashboard`)
};

export const getVendorReviews = async () => {
  return apiFetch(`/vendors/reviews`)
}

export const getVendorNotifications = async () => {
  return apiFetch(`/vendors/notifications`)
}

export const getVendorPayouts = async () => {
  return apiFetch(`/payouts/vendor`)
}

export const markVendorNotificationRead = async (notificationId: string) => {
  return apiFetch(`/vendors/notifications/${notificationId}/read`, {
    method: "PATCH",
  })
}

export const getAllServices = async () => {
  return apiFetch("/services?limit=1000&offset=0")
}
