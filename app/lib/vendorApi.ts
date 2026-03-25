import { apiFetch } from "@/app/lib/api"

export type VendorBookingStatus = "pending" | "accepted" | "completed" | "cancelled"

export const getVendorMe = async () => {
  console.log("Vendor API GET /vendors/me");
  const res = await apiFetch(`/vendors/me`)
  console.log("Vendor API GET /vendors/me response:", res);
  if (res?.error) console.error("Vendor API GET /vendors/me error:", res);
  return res;
}

export const updateVendorMe = async (payload: Record<string, unknown>) => {
  console.log("Vendor API PATCH /vendors/profile payload:", payload);
  const res = await apiFetch(`/vendors/profile`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  console.log("Vendor API PATCH /vendors/profile response:", res);
  if (res?.error) console.error("Vendor API PATCH /vendors/profile error:", res);
  return res;
}

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
  console.log("Vendor API POST /vendors/upload-multiple files count:", files.length);
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))

  const res = await apiFetch("/vendors/upload-multiple", {
    method: "POST",
    body: formData,
  });
  console.log("Vendor API POST /vendors/upload-multiple response:", res);
  if (res?.error) console.error("Vendor API POST /vendors/upload-multiple error:", res);
  return res;
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

export const getVendorBookings = async (bucket?: string) => {
  const query = bucket ? `?bucket=${encodeURIComponent(bucket)}` : ""
  return apiFetch(`/vendors/bookings${query}`)
}

export const updateVendorBookingStatus = async (
  bookingId: string,
  status: VendorBookingStatus,
) => {
  return apiFetch(`/vendors/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

export const getVendorDashboard = async () => {
  console.log("Vendor API GET /vendors/dashboard");

  const res = await apiFetch(`/vendors/dashboard`);

  console.log("FULL RESPONSE:", JSON.stringify(res, null, 2));

  if (res && res.error === true) {
    console.error("❌ Dashboard API FAILED:", res);
    return null;
  }

  console.log("✅ Dashboard API SUCCESS:", res);
  return res;
};

export const getVendorReviews = async () => {
  return apiFetch(`/vendors/reviews`)
}

export const getVendorNotifications = async () => {
  return apiFetch(`/vendors/notifications`)
}

export const markVendorNotificationRead = async (notificationId: string) => {
  return apiFetch(`/vendors/notifications/${notificationId}/read`, {
    method: "PATCH",
  })
}

export const getAllServices = async () => {
  return apiFetch("/services?limit=1000&offset=0")
}
