"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadVendorPortfolioMultiple, uploadVendorFile } from "@/app/lib/vendorApi";
import { useToast } from "@/context/ToastContext";
import { useVendorData } from "@/context/VendorContext";
import { API_URL } from "@/app/lib/api"

// Static uploads are served at the backend origin without /api prefix
const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, "");
import VerifiedVendor from "@/components/vendor/VerifiedVendor";

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
  isVerified?: boolean;
  verified?: boolean;
  profileCompleted?: boolean;
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

/** Compress an image file to max 800px wide, JPEG quality 0.75, max ~300KB */
const compressImage = (file: File, maxPx = 800, quality = 0.75): Promise<File> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });

const resolveImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("https")) return path;
  if (path.startsWith("/")) return `${BACKEND_ORIGIN}${path}`;
  return `${BACKEND_ORIGIN}/${path}`;
};

export default function BusinessProfile() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { vendorProfile, loadingProfile, saveVendorProfile } = useVendorData();
  const typedVendorProfile = vendorProfile as VendorProfileData | null;

  // Local form state - NOT overwritten by context
const [form, setForm] = useState({
    businessName: "",
    description: "",
    category: "",
    location: "",
    experience: "",
    profileImage: "",
  });
  const [packages, setPackages] = useState<VendorPackage[]>([]);
  const [packageForm, setPackageForm] = useState<PackageInput>(initialPackage);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [error, setError] = useState("");
  
  const initialized = useRef(false);

  useEffect(() => {
    console.log("🔄 Profile effect - typedVendorProfile:", !!typedVendorProfile);
    if (typedVendorProfile && !initialized.current) {
      console.log("📥 SET INITIAL FORM ONCE");
      setForm({
        businessName: String(typedVendorProfile.businessName || typedVendorProfile.name || ""),
        description: String(typedVendorProfile.description || ""),
        category: Array.isArray(typedVendorProfile.category) ? typedVendorProfile.category.join(", ") : "",
        location: String(typedVendorProfile?.location?.address || ""),
        experience: String(typedVendorProfile.experience || ""),
        profileImage: String(typedVendorProfile.profileImage || typedVendorProfile.image || ""),
      });
      setPackages(Array.isArray(typedVendorProfile.packages) ? typedVendorProfile.packages : []);
      setProfileImagePreview(resolveImageUrl(String(typedVendorProfile.profileImage || typedVendorProfile.image || "")));
      initialized.current = true;
    }
  }, [profile?.uid]);

  const galleryImages = useMemo(() => {
    if (!typedVendorProfile) return [];
    if (Array.isArray(typedVendorProfile.portfolio) && typedVendorProfile.portfolio.length) {
      return typedVendorProfile.portfolio
        .map((item) => item.url)
        .filter(Boolean)
        .map(resolveImageUrl);
    }
    const gallery = Array.isArray(typedVendorProfile.gallery) ? typedVendorProfile.gallery : [];
    return gallery.map(resolveImageUrl);
  }, [typedVendorProfile]);

  const onFormChange = (key: keyof typeof form, value: string) => {
    console.log("📝 Form change", key, value);
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSave = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!profile?.uid) return;

    console.log("🚀 SAVING - form:", form, "packages:", packages);

    setSaving(true);
    setError("");

    const categories = form.category.split(",").map((item) => item.trim()).filter(Boolean);

    const payload = {
      businessName: form.businessName,
      description: form.description,
      category: categories,
      location: { address: form.location },
      experience: form.experience,
      profileImage: form.profileImage,
      packages,
    };

    try {
      const response = await saveVendorProfile(payload);
      console.log("✅ SAVE SUCCESS:", response);

      // OPTIMISTIC - update local form (no refresh needed)
      showToast("✅ Profile saved! Services visible to customers.", "success");
    } catch (err: any) {
      console.error("❌ SAVE FAILED:", err);
      setError(err.message || "Save failed");
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("🖼️ UPLOADING PROFILE:", file.name);
    setProfileImagePreview(URL.createObjectURL(file));
    setUploadingProfile(true);

    try {
      const compressed = await compressImage(file);
      const response = await uploadVendorFile(compressed);
      console.log("📤 UPLOAD RESPONSE:", response);

      const imageUrl = response.fullUrl || response.url || response.filename ? `/uploads/${response.filename}` : '';
      console.log("🖼️ SETTING IMAGE URL:", imageUrl);

      // OPTIMISTIC UPDATE
      setForm((prev) => ({ ...prev, profileImage: imageUrl }));
      setProfileImagePreview(resolveImageUrl(imageUrl));
      showToast("✅ Profile image updated", "success");
    } catch (err: any) {
      console.error("❌ UPLOAD FAILED:", err);
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handlePortfolioUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!profile?.uid || !event.target.files?.length) return;

    const selectedFiles = Array.from(event.target.files);
    const existingCount = galleryImages.length;
    if (existingCount + selectedFiles.length > 7) {
      showToast("Max 7 portfolio images", "error");
      return;
    }

    setUploadingGallery(true);
    try {
      const compressedFiles = await Promise.all(selectedFiles.map((f) => compressImage(f)));
      const response = await uploadVendorPortfolioMultiple(compressedFiles);
      console.log("📤 PORTFOLIO RESPONSE:", response);

      // uploadVendorPortfolioMultiple returns string[], handle both string and object items
      const newUrls: string[] = Array.isArray(response)
        ? response.map((item: any) => (typeof item === "string" ? item : item.url || item.fullUrl || "")).filter(Boolean)
        : [];
      showToast(`${newUrls.length} image${newUrls.length !== 1 ? "s" : ""} uploaded`, "success");

      // Merge new images with existing portfolio (don't overwrite)
      const existingUrls = (typedVendorProfile?.portfolio || [])
        .map((item: any) => (typeof item === "string" ? item : item.url || ""))
        .filter(Boolean) as string[];
      const allUrls = [...existingUrls, ...newUrls].slice(0, 7);
      const portfolioUpdate = { portfolio: allUrls.map(url => ({ url, caption: "" })) };
      await saveVendorProfile(portfolioUpdate);
    } catch (err: any) {
      console.error("PORTFOLIO FAILED:", err);
      showToast(err.message || "Portfolio upload failed", "error");
    } finally {
      setUploadingGallery(false);
      event.target.value = "";
    }
  };

  const addPackageLocally = () => {
    if (!packageForm.name || !packageForm.price) {
      showToast("Name & price required", "error");
      return;
    }

    const newPackage = {
      name: packageForm.name,
      price: Number(packageForm.price),
      description: packageForm.description,
      servicesIncluded: packageForm.servicesIncluded.split(',').map(item => item.trim()).filter(Boolean),
    };

    console.log("📦 ADD PACKAGE:", newPackage);
    setPackages((current) => [...current, newPackage]);
    setPackageForm(initialPackage);
    showToast("Package added", "info");
  };

  if (loadingProfile) {
    return (
      <div className="space-y-4 p-8 text-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
        <p>Loading business profile...</p>
      </div>
    );
  }

  console.log("🎨 RENDER - form:", form, "profileImagePreview:", profileImagePreview);

  return (
    <div className="space-y-6">
      {typedVendorProfile?.isVerified && <VerifiedVendor />}
      
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Business Profile</h1>
          <p className="text-muted-foreground">Manage your brand and services.</p>
        </div>
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="theme-button text-sm font-medium"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {error && <div className="p-3 bg-destructive/10 border border-destructive rounded-md">{error}</div>}

      <form onSubmit={(e) => handleSave(e)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <div className="space-y-3">
              <input 
                value={form.businessName}
                onChange={(e) => onFormChange("businessName", e.target.value)}
                placeholder="Business Name *"
                className="input"
              />
              <textarea 
                value={form.description}
                onChange={(e) => onFormChange("description", e.target.value)}
                placeholder="Business description"
                rows={3}
                className="input resize-vertical"
              />
              <input 
                value={form.category}
                onChange={(e) => onFormChange("category", e.target.value)}
                placeholder="Categories (comma separated)"
                className="input"
              />
              <input 
                value={form.location}
                onChange={(e) => onFormChange("location", e.target.value)}
                placeholder="Location / Service Area"
                className="input"
              />
              <input 
                value={form.experience}
                onChange={(e) => onFormChange("experience", e.target.value)}
                placeholder="Years of Experience"
                className="input"
              />
            </div>
          </div>

          <div className="border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Service Packages</h3>
            {packages.length === 0 ? (
              <p className="text-muted-foreground">Add packages to showcase your pricing.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {packages.map((pkg, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{pkg.name}</p>
                        <p className="text-sm text-muted-foreground">₹{pkg.price}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setPackages(p => p.filter((_, i) => i !== index))}
                        className="text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                    {pkg.description && <p className="text-sm mt-1">{pkg.description}</p>}
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
              <input 
                value={packageForm.name}
                onChange={(e) => setPackageForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Package name"
                className="input"
              />
              <input 
                value={packageForm.price}
                onChange={(e) => setPackageForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Price (₹)"
                className="input"
              />
              <textarea 
                value={packageForm.description}
                onChange={(e) => setPackageForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                rows={2}
                className="input"
              />
              <input 
                value={packageForm.servicesIncluded}
                onChange={(e) => setPackageForm(prev => ({ ...prev, servicesIncluded: e.target.value }))}
                placeholder="Services (comma separated)"
                className="input"
              />
              <button 
                type="button"
                onClick={addPackageLocally}
                className="theme-button-secondary w-full font-medium"
              >
                Add Package
              </button>
            </div>
          </div>
        </div>

        {/* Right: Preview & Upload */}
        <div className="space-y-6">
          <div className="border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Profile Image</h3>
            <div className="space-y-3">
              <div className="relative">
                <img 
                  src={profileImagePreview || "/placeholder-avatar.jpg"} 
                  alt="Profile preview"
                  className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-muted shadow-lg"
                />
                {uploadingProfile && (
                  <div className="absolute inset-0 bg-primary/20 animate-pulse rounded-full" />
                )}
              </div>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleProfileUpload}
                className="input file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--primary-light)] file:text-[var(--primary)] hover:file:bg-[var(--primary)] hover:file:text-white file:cursor-pointer file:transition-all"
              />
              {uploadingProfile && <p className="text-sm text-muted-foreground text-center">Uploading...</p>}
            </div>
          </div>

          <div className="border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Portfolio (Max 7)</h3>
            <input 
              type="file" 
              accept="image/jpeg,image/jpg,image/png"
              multiple
              max={7}
              onChange={handlePortfolioUpload}
              className="input file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--secondary-soft)] file:text-[var(--secondary)] hover:file:bg-[var(--secondary)] hover:file:text-white file:cursor-pointer file:transition-all"
            />
            {uploadingGallery && <p className="text-sm text-muted-foreground text-center">Uploading...</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
              {galleryImages.slice(0, 7).map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={imageUrl} 
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center transition-all">
                    <span className="text-white text-xs font-medium">✓</span>
                  </div>
                </div>
              ))}
            </div>
            {galleryImages.length >= 7 && (
              <p className="text-xs text-muted-foreground mt-2">Portfolio full (max 7 images)</p>
            )}
          </div>

          <div className="border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Live Preview</h3>
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center p-1">
                <img 
                  src={profileImagePreview || "/placeholder-avatar.jpg"} 
                  className="w-14 h-14 rounded-full object-cover shadow-lg border-2 border-background"
                />
              </div>
              <p className="font-semibold">{form.businessName || "Your Business"}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{form.description}</p>
              <p className="text-xs text-muted-foreground">{form.location}</p>
              <p className="text-xs bg-muted px-2 py-1 rounded-full">{form.experience || "0+"} years</p>
              <p className="text-xs text-muted-foreground">Packages: {packages.length}</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

