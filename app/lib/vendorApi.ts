import { apiFetch } from "@/app/lib/api"

export type VendorBookingStatus = "pending" | "accepted" | "rejected" | "completed"

export type UploadResponse = {
  filename?: string;
  fullUrl?: string;
  url?: string;
}

export const getVendorMe = async (): Promise<any> => {
  console.log("📡 GET /vendors/me");
  return apiFetch(`/vendors/me`);
}

export const saveVendorProfile = async (payload: Record<string, unknown>): Promise<any> => {
  console.log("📡 PATCH /vendors/profile:", payload);
  return apiFetch(`/vendors/profile`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const updateVendorMe = saveVendorProfile;

export const uploadVendorFile = async (file: File): Promise<UploadResponse> => {
  console.log("📤 SINGLE UPLOAD:", file.name);
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await apiFetch("/vendors/upload", {
    method: "POST",
    body: formData,
  }) as any;

  const filename = response.filename || response.file?.filename || '';
  const url = response.fullUrl || response.url || (filename ? `/uploads/${filename}` : '');
  
  console.log("✅ UPLOAD:", { filename, url });
  return { filename, fullUrl: url, url };
};

export const uploadVendorPortfolioMultiple = async (files: File[]): Promise<string[]> => {
  console.log("📤 MULTIPLE UPLOAD:", files.length);
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));

  const response = await apiFetch("/vendors/upload-multiple", {
    method: "POST",
    body: formData,
  }) as any;

  const urls: string[] = Array.isArray(response) 
    ? response.map((item: any) => item.url || item.fullUrl || '').filter(Boolean)
    : response.data?.map((item: any) => item.url || item.fullUrl || '').filter(Boolean) || [];

  console.log("✅ MULTIPLE:", urls);
  return urls;
};

export const updateVendorBookingStatus = async (
  bookingId: string,
  status: VendorBookingStatus,
): Promise<boolean> => {
  await apiFetch(`/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return true;
};

export const getAllServices = async () => apiFetch("/services?limit=1000&offset=0");

export const assignVendorServices = async (serviceIds: string[]): Promise<any> => {
  console.log("📡 PATCH /vendors/services:", serviceIds.length);
  return apiFetch("/vendors/services", {
    method: "PATCH",
    body: JSON.stringify({ servicesOffered: serviceIds }),
  });
};

export type VendorBooking = any;

export const getVendorBookings = async (): Promise<VendorBooking[]> => {
  console.log("📡 GET /vendors/bookings");
  const response = await apiFetch("/vendors/bookings");
  return Array.isArray(response) ? response : [];
};

export type VendorNotification = any;

export const getVendorNotifications = async (): Promise<VendorNotification[]> => {
  console.log("📡 GET /vendors/notifications");
  const response = await apiFetch("/vendors/notifications");
  return Array.isArray(response) ? response : [];
};

export const markVendorNotificationRead = async (notificationId: string): Promise<any> => {
  console.log("📡 PATCH /vendors/notifications/", notificationId, "/read");
  return apiFetch(`/vendors/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
};

export const getVendorPayouts = async (): Promise<any[]> => {
  console.log("📡 GET /vendors/payouts");
  const response = await apiFetch("/vendors/payouts");
  return Array.isArray(response) ? response : [];
};

export const getVendorReviews = async (): Promise<any[]> => {
  console.log("📡 GET /vendors/reviews");
  const response = await apiFetch("/vendors/reviews");
  return Array.isArray(response) ? response : [];
};

