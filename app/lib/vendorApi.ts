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

