"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadVendorPortfolioMultiple } from "@/app/lib/vendorApi";
import { useToast } from "@/context/ToastContext";
import { useVendorData } from "@/context/VendorContext";
import { API_URL } from "@/app/lib/api";

type VendorProfileData = {
  name?: string;
  businessName?: string;
  description?: string;
  category?: string[];
  location?: { address?: string };
  experience?: string;
  profileImage?: string;
  image?: string;
  portfolio?: Array<{ url?: string; caption?: string }>;
  gallery?: string[];
  packages?: Array<{
    name?: string;
    price?: number;
    description?: string;
    servicesIncluded?: string[];
  }>;
};

type PackageInput = {
  name: string;
  price: string;
  description: string;
  servicesIncluded: string;
};

type VendorPackage = {
  name?: string;
  price?: number;
  description?: string;
  servicesIncluded?: string[] | string;
};

const initialPackage: PackageInput = {
  name: "",
  price: "",
  description: "",
  servicesIncluded: "",
};

const resolveImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${API_URL}${path}`;
  return `${API_URL}/${path}`;
};

export default function BusinessProfile() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const {
    vendorProfile,
    loadingProfile,
    refreshVendorProfile,
    refreshDashboard,
    saveVendorProfile,
  } = useVendorData();
  const typedVendorProfile = vendorProfile as VendorProfileData | null;

  const [form, setForm] = useState({
    businessName: "",
    description: "",
    category: "",
    location: "",
    experience: "",
  });
  const [packages, setPackages] = useState<VendorPackage[]>([]);
  const [packageForm, setPackageForm] = useState<PackageInput>(initialPackage);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!typedVendorProfile) return;

    setForm({
      businessName: String(typedVendorProfile.businessName || typedVendorProfile.name || ""),
      description: String(typedVendorProfile.description || ""),
      category: Array.isArray(typedVendorProfile.category) ? typedVendorProfile.category.join(", ") : "",
      location: String(typedVendorProfile?.location?.address || ""),
      experience: String(typedVendorProfile.experience || ""),
    });

    setPackages(Array.isArray(typedVendorProfile.packages) ? typedVendorProfile.packages : []);
    setProfileImagePreview(resolveImageUrl(String(typedVendorProfile.profileImage || typedVendorProfile.image || "")));
  }, [typedVendorProfile]);

  const galleryImages = useMemo(() => {
    if (!typedVendorProfile) return [];
    if (Array.isArray(typedVendorProfile.portfolio) && typedVendorProfile.portfolio.length) {
      return typedVendorProfile.portfolio
        .map((item) => item.url)
        .filter((value): value is string => Boolean(value))
        .map((value) => resolveImageUrl(value));
    }
    const gallery = Array.isArray(typedVendorProfile.gallery) ? typedVendorProfile.gallery : [];
    return gallery.map((value) => resolveImageUrl(value));
  }, [typedVendorProfile]);

  const onFormChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!profile?.uid) return;

    setSaving(true);
    setError("");

    const categories = form.category
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const response = await saveVendorProfile({
      name: form.businessName,
      businessName: form.businessName,
      description: form.description,
      category: categories,
      location: {
        address: form.location,
      },
      experience: form.experience,
      packages: packages.map((pkg) => ({
        name: String(pkg.name || ""),
        price: Number(pkg.price || 0),
        description: String(pkg.description || ""),
        servicesIncluded: Array.isArray(pkg.servicesIncluded)
          ? pkg.servicesIncluded
          : String(pkg.servicesIncluded || "")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
      })),
    });

    if (response?.error) {
      const message = String(response.message || "Could not save profile");
      setError(message);
      showToast(message, "error");
      setSaving(false);
      return;
    }

    await refreshVendorProfile();
    await refreshDashboard();
    showToast("Profile updated successfully", "success");
    setSaving(false);
  };

  const handleProfileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;

    const file = event.target.files[0];
    setProfileImagePreview(URL.createObjectURL(file));
    setUploadingProfile(true);

    const { uploadVendorFile } = await import("@/app/lib/vendorApi");
    const response = await uploadVendorFile(file);

    if ((response as any)?.error) {
      const message = String((response as any).message || "Profile image upload failed");
      setError(message);
      showToast(message, "error");
      setUploadingProfile(false);
      return;
    }

    // Update profile with the full URL
    const updateResponse = await saveVendorProfile({
      profileImage: (response as any).fullUrl,
    });

    if ((updateResponse as any)?.error) {
      const message = String((updateResponse as any).message || "Could not update profile image");
      setError(message);
      showToast(message, "error");
      setUploadingProfile(false);
      return;
    }

    await refreshVendorProfile();
    showToast("Profile image updated", "success");
    setUploadingProfile(false);
  };

  const handlePortfolioUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!profile?.uid || !event.target.files?.length) return;

    const selectedFiles = Array.from(event.target.files);
    const existingCount = galleryImages.length;
    if (existingCount + selectedFiles.length > 7) {
      const message = "You can upload up to 7 portfolio images";
      setError(message);
      showToast(message, "error");
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) => !["image/jpeg", "image/jpg", "image/png"].includes(file.type),
    );
    if (invalidFile) {
      const message = "Only jpg, jpeg, and png files are allowed";
      setError(message);
      showToast(message, "error");
      return;
    }

    setUploadingGallery(true);

    const response = await uploadVendorPortfolioMultiple(selectedFiles);
    if ((response as any)?.error) {
      const message = String((response as any).message || "Portfolio upload failed");
      setError(message);
      showToast(message, "error");
      setUploadingGallery(false);
      return;
    }

    const uploaded = Array.isArray(response)
      ? response
      : Array.isArray((response as { data?: unknown[] })?.data)
        ? ((response as { data: unknown[] }).data as Array<{ url?: string }>)
        : [];

    const incomingPortfolio = uploaded
      .map((item) => ({
        url: String(item?.url || ""),
        caption: "",
      }))
      .filter((item) => Boolean(item.url));

    if (!incomingPortfolio.length) {
      const message = "No valid images were uploaded";
      setError(message);
      showToast(message, "error");
      setUploadingGallery(false);
      return;
    }

    const existingPortfolio = Array.isArray(typedVendorProfile?.portfolio)
      ? typedVendorProfile.portfolio.map((item) => ({
          url: String(item?.url || ""),
          caption: String(item?.caption || ""),
        }))
      : [];

    const nextPortfolio = [...existingPortfolio, ...incomingPortfolio].slice(0, 7);
    const updateResponse = await saveVendorProfile({
      portfolio: nextPortfolio,
      gallery: nextPortfolio.map((item) => item.url),
    });

    if (updateResponse?.error) {
      const message = String(updateResponse.message || "Failed to save portfolio");
      setError(message);
      showToast(message, "error");
      setUploadingGallery(false);
      return;
    }

    await refreshVendorProfile();
    showToast("Portfolio updated", "success");
    setUploadingGallery(false);
    event.target.value = "";
  };

  const addPackageLocally = () => {
    if (!packageForm.name || !packageForm.price) {
      const message = "Package name and price are required";
      setError(message);
      showToast(message, "error");
      return;
    }

    setPackages((current) => [
      ...current,
      {
        name: packageForm.name,
        price: Number(packageForm.price),
        description: packageForm.description,
        servicesIncluded: packageForm.servicesIncluded
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
    ]);

    setPackageForm(initialPackage);
    showToast("Package added to draft", "info");
  };

  if (loadingProfile) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-48 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Business Profile</h1>
          <p className="text-gray-500 text-sm">Manage your brand identity, services, and settings.</p>
        </div>

        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSave} className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="theme-card p-5 space-y-3">
            <h3 className="font-semibold">Basic Info</h3>
            <input value={form.businessName} onChange={(e) => onFormChange("businessName", e.target.value)} placeholder="Business Name" className="w-full border rounded-md p-2" />
            <textarea value={form.description} onChange={(e) => onFormChange("description", e.target.value)} placeholder="Description" className="w-full border rounded-md p-2" />
            <input value={form.category} onChange={(e) => onFormChange("category", e.target.value)} placeholder="Category (comma separated)" className="w-full border rounded-md p-2" />
            <input value={form.location} onChange={(e) => onFormChange("location", e.target.value)} placeholder="Location" className="w-full border rounded-md p-2" />
            <input value={form.experience} onChange={(e) => onFormChange("experience", e.target.value)} placeholder="Experience" className="w-full border rounded-md p-2" />
          </div>

          <div className="theme-card p-5 space-y-3">
            <h3 className="font-semibold">Packages</h3>

            {packages.length === 0 ? (
              <p className="text-sm text-gray-500">No packages added yet</p>
            ) : (
              <div className="space-y-2">
                {packages.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="border rounded-md p-3">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">₹{Number(item.price || 0)}</p>
                    {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <input value={packageForm.name} onChange={(e) => setPackageForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Package name" className="border rounded-md p-2" />
              <input value={packageForm.price} onChange={(e) => setPackageForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="Price" className="border rounded-md p-2" />
            </div>
            <input value={packageForm.description} onChange={(e) => setPackageForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" className="w-full border rounded-md p-2" />
            <input value={packageForm.servicesIncluded} onChange={(e) => setPackageForm((prev) => ({ ...prev, servicesIncluded: e.target.value }))} placeholder="Services included (comma separated)" className="w-full border rounded-md p-2" />
            <button type="button" onClick={addPackageLocally} className="border px-4 py-2 rounded-md text-sm">Add Package</button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="theme-card p-5 space-y-3">
            <h3 className="font-semibold">Profile Image</h3>
            <input type="file" accept="image/*" onChange={(e) => void handleProfileUpload(e)} />
            {uploadingProfile && <p className="text-sm text-gray-500">Uploading...</p>}
          </div>

          <div className="theme-card p-5 space-y-3">
            <h3 className="font-semibold">Portfolio</h3>
            <input type="file" accept="image/jpeg,image/jpg,image/png" multiple onChange={(e) => void handlePortfolioUpload(e)} />
            {uploadingGallery && <p className="text-sm text-gray-500">Uploading...</p>}
            <div className="grid grid-cols-2 gap-2">
              {galleryImages.slice(0, 7).map((imageUrl: string, index: number) => (
                <img key={`${imageUrl}-${index}`} src={imageUrl} alt={`Gallery ${index + 1}`} className="w-full h-20 object-cover rounded" />
              ))}
            </div>
          </div>

          <div className="theme-card p-5 space-y-2">
            <h3 className="font-semibold">Live Preview</h3>
            <img src={profileImagePreview || "/eventra_photos/photographer.jpg"} alt="Profile preview" className="w-16 h-16 rounded-full object-cover" />
            <p className="font-medium">{form.businessName || "Business Name"}</p>
            <p className="text-sm text-gray-600">{form.description || "Description preview"}</p>
            <p className="text-sm text-gray-500">{form.location || "Location"}</p>
            <p className="text-sm text-gray-500">{form.experience || "Experience"}</p>
            <p className="text-sm text-gray-500">Packages: {packages.length}</p>
          </div>
        </div>
      </form>
    </div>
  );
}
