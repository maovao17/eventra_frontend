"use client";

import { ChangeEvent, FormEvent, useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadVendorPortfolioMultiple, uploadVendorFile, addVendorPackage, removeVendorPackage } from "@/app/lib/vendorApi";
import { useToast } from "@/context/ToastContext";
import { useVendorData } from "@/context/VendorContext";
import { API_URL } from "@/app/lib/api";
import { Trash2 } from "lucide-react";
import VerifiedVendor from "@/components/vendor/VerifiedVendor";

const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, "");

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
  _id?: string;
  name?: string;
  price?: number;
  description?: string;
  servicesIncluded?: string[] | string;
};

const initialPackage: PackageInput = { name: "", price: "", description: "", servicesIncluded: "" };

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
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${BACKEND_ORIGIN}${path}`;
  return `${BACKEND_ORIGIN}/${path}`;
};

export default function BusinessProfile() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { vendorProfile, loadingProfile, saveVendorProfile, refreshVendorProfile } = useVendorData();
  const typedVendorProfile = vendorProfile as VendorProfileData | null;

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
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [addingPackage, setAddingPackage] = useState(false);
  const [removingPackageId, setRemovingPackageId] = useState<string | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [error, setError] = useState("");
  const initialized = useRef(false);

  useEffect(() => {
    if (!typedVendorProfile || initialized.current) return;

    setForm({
      businessName: String(typedVendorProfile.businessName || typedVendorProfile.name || ""),
      description: String(typedVendorProfile.description || ""),
      category: Array.isArray(typedVendorProfile.category) ? typedVendorProfile.category.join(", ") : "",
      location: String(typedVendorProfile?.location?.address || ""),
      experience: String(typedVendorProfile.experience || ""),
      profileImage: String(typedVendorProfile.profileImage || typedVendorProfile.image || ""),
    });

    const serverPkgs = Array.isArray(typedVendorProfile.packages)
      ? typedVendorProfile.packages.filter((p: any) => p?.name)
      : [];
    setPackages(serverPkgs);

    const existingPortfolio = Array.isArray(typedVendorProfile.portfolio)
      ? typedVendorProfile.portfolio.map((item: any) => item?.url || "").filter(Boolean)
      : Array.isArray(typedVendorProfile.gallery)
      ? typedVendorProfile.gallery
      : [];
    setPortfolioUrls(existingPortfolio as string[]);

    const img = typedVendorProfile.profileImage || typedVendorProfile.image || "";
    setProfileImagePreview(resolveImageUrl(img));
    initialized.current = true;
  }, [typedVendorProfile]);

  const onFormChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSave = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!profile?.uid) return;
    setSaving(true);
    setError("");

    const categories = form.category.split(",").map(item => item.trim()).filter(Boolean);
    const payload = {
      businessName: form.businessName,
      description: form.description,
      category: categories,
      location: { address: form.location },
      experience: form.experience,
      profileImage: form.profileImage,
      portfolio: portfolioUrls.map(url => ({ url, caption: "" })),
    };

    try {
      await saveVendorProfile(payload);
      showToast("Profile saved!", "success");
    } catch (err: any) {
      setError(err.message || "Save failed");
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileImagePreview(URL.createObjectURL(file));
    setUploadingProfile(true);

    try {
      const compressed = await compressImage(file);
      const response = await uploadVendorFile(compressed);

      // Cloudinary returns fullUrl (https://...), fallback to url, then /uploads/filename
      const imageUrl: string = response.fullUrl || response.url
        || (response.filename ? `/uploads/${response.filename}` : "");

      setForm(prev => ({ ...prev, profileImage: imageUrl }));
      setProfileImagePreview(resolveImageUrl(imageUrl));
      showToast("Profile image updated", "success");
    } catch (err: any) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handlePortfolioUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!profile?.uid || !event.target.files?.length) return;

    const selectedFiles = Array.from(event.target.files);
    if (portfolioUrls.length + selectedFiles.length > 7) {
      showToast(`Can only add ${7 - portfolioUrls.length} more image(s)`, "error");
      event.target.value = "";
      return;
    }

    setUploadingGallery(true);
    try {
      const compressedFiles = await Promise.all(selectedFiles.map(f => compressImage(f)));
      const response = await uploadVendorPortfolioMultiple(compressedFiles);

      const newUrls: string[] = Array.isArray(response)
        ? response.map((item: any) =>
            typeof item === "string" ? item : item.url || item.fullUrl || ""
          ).filter(Boolean)
        : [];

      if (newUrls.length === 0) {
        showToast("No images were uploaded", "error");
        return;
      }

      const allUrls = [...portfolioUrls, ...newUrls].slice(0, 7);
      setPortfolioUrls(allUrls);

      // Save immediately so it persists
      await saveVendorProfile({
        portfolio: allUrls.map(url => ({ url, caption: "" })),
      });
      showToast(`${newUrls.length} image${newUrls.length !== 1 ? "s" : ""} added`, "success");
    } catch (err: any) {
      showToast(err.message || "Portfolio upload failed", "error");
    } finally {
      setUploadingGallery(false);
      event.target.value = "";
    }
  };

  const removePortfolioImage = async (indexToRemove: number) => {
    const updated = portfolioUrls.filter((_, i) => i !== indexToRemove);
    setPortfolioUrls(updated);
    try {
      await saveVendorProfile({
        portfolio: updated.map(url => ({ url, caption: "" })),
      });
      showToast("Image removed", "success");
    } catch {
      // Revert on failure
      setPortfolioUrls(portfolioUrls);
      showToast("Failed to remove image", "error");
    }
  };

  const addPackage = async () => {
    if (!packageForm.name || !packageForm.price) {
      showToast("Name & price required", "error");
      return;
    }
    const optimistic: VendorPackage = {
      name: packageForm.name,
      price: Number(packageForm.price),
      description: packageForm.description,
      servicesIncluded: packageForm.servicesIncluded.split(",").map(s => s.trim()).filter(Boolean),
    };
    // Optimistically show the package immediately
    setPackages(prev => [...prev, optimistic]);
    setPackageForm(initialPackage);
    setAddingPackage(true);
    try {
      const updated = await addVendorPackage({
        name: optimistic.name!,
        price: optimistic.price!,
        description: optimistic.description,
        servicesIncluded: optimistic.servicesIncluded as string[],
      });
      // Replace with server response (which has real _ids) if available
      const serverPkgs: VendorPackage[] = (updated as any)?.packages ?? [];
      if (serverPkgs.length > 0) {
        setPackages(serverPkgs.filter((p) => p?.name));
      }
      showToast("Package saved!", "success");
      void refreshVendorProfile();
    } catch (err: any) {
      // Revert optimistic add on failure
      setPackages(prev => prev.filter(p => p !== optimistic));
      showToast(err?.message || "Failed to save package", "error");
    } finally {
      setAddingPackage(false);
    }
  };

  const deletePackage = async (pkg: VendorPackage, index: number) => {
    const id = pkg._id;
    // Optimistically remove
    setPackages(prev => prev.filter((_, i) => i !== index));
    setRemovingPackageId(id ?? String(index));
    try {
      if (id) {
        const updated = await removeVendorPackage(id);
        const serverPkgs: VendorPackage[] = (updated as any)?.packages ?? [];
        if (serverPkgs.length > 0 || (updated as any)?.packages !== undefined) {
          setPackages(serverPkgs.filter((p) => p?.name));
        }
      }
      showToast("Package removed", "success");
    } catch (err: any) {
      // Revert on failure
      setPackages(prev => {
        const copy = [...prev];
        copy.splice(index, 0, pkg);
        return copy;
      });
      showToast(err?.message || "Failed to remove package", "error");
    } finally {
      setRemovingPackageId(null);
    }
  };

  if (loadingProfile && !typedVendorProfile) {
    return (
      <div className="space-y-4 p-8 text-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--primary)] rounded-full animate-spin mx-auto" />
        <p>Loading business profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {typedVendorProfile?.isVerified && <VerifiedVendor />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Business Profile</h1>
          <p className="theme-muted text-sm">Manage your brand and services.</p>
        </div>
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="theme-button text-sm font-medium"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={e => handleSave(e)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="theme-card rounded-xl p-6">
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <div className="space-y-3">
              <input
                value={form.businessName}
                onChange={e => onFormChange("businessName", e.target.value)}
                placeholder="Business Name *"
                className="input"
              />
              <textarea
                value={form.description}
                onChange={e => onFormChange("description", e.target.value)}
                placeholder="Business description"
                rows={3}
                className="input resize-vertical"
              />
              <input
                value={form.category}
                onChange={e => onFormChange("category", e.target.value)}
                placeholder="Categories (comma separated, e.g. Photography, Catering)"
                className="input"
              />
              <input
                value={form.location}
                onChange={e => onFormChange("location", e.target.value)}
                placeholder="Location / Service Area"
                className="input"
              />
              <input
                value={form.experience}
                onChange={e => onFormChange("experience", e.target.value)}
                placeholder="Years of Experience"
                className="input"
              />
            </div>
          </div>

          <div className="theme-card rounded-xl p-6">
            <h3 className="font-semibold mb-4">Service Packages</h3>
            {packages.length > 0 && (
              <div className="space-y-3 mb-4">
                {packages.map((pkg, index) => (
                  <div key={index} className="p-4 theme-surface rounded-xl flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{pkg.name}</p>
                      <p className="text-sm theme-muted">₹{pkg.price?.toLocaleString("en-IN")}</p>
                      {pkg.description && <p className="text-sm mt-1">{pkg.description}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => void deletePackage(pkg, index)}
                      disabled={removingPackageId === (pkg._id ?? String(index))}
                      className="text-red-400 hover:text-red-600 p-1 rounded transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-3 p-4 border rounded-xl bg-[var(--surface)]">
              <p className="text-sm font-medium theme-muted">Add a new package</p>
              <input
                value={packageForm.name}
                onChange={e => setPackageForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Package name"
                className="input"
              />
              <input
                value={packageForm.price}
                onChange={e => setPackageForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Price (₹)"
                type="number"
                min={0}
                className="input"
              />
              <textarea
                value={packageForm.description}
                onChange={e => setPackageForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                rows={2}
                className="input"
              />
              <input
                value={packageForm.servicesIncluded}
                onChange={e => setPackageForm(prev => ({ ...prev, servicesIncluded: e.target.value }))}
                placeholder="Services included (comma separated)"
                className="input"
              />
              <button
                type="button"
                onClick={() => void addPackage()}
                disabled={addingPackage}
                className="w-full rounded-xl border px-4 py-2 text-sm font-medium hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors disabled:opacity-50"
              >
                {addingPackage ? "Adding..." : "+ Add Package"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Images */}
        <div className="space-y-6">
          {/* Profile image */}
          <div className="theme-card rounded-xl p-6">
            <h3 className="font-semibold mb-4">Profile Image</h3>
            <div className="space-y-3">
              <div className="relative mx-auto w-24 h-24">
                <img
                  src={profileImagePreview || "/placeholder-avatar.jpg"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[var(--surface)] shadow-lg"
                />
                {uploadingProfile && (
                  <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <label className="block w-full cursor-pointer rounded-xl border border-dashed px-4 py-3 text-center text-sm theme-muted hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                {uploadingProfile ? "Uploading..." : "Click to change photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileUpload}
                  className="hidden"
                  disabled={uploadingProfile}
                />
              </label>
            </div>
          </div>

          {/* Portfolio */}
          <div className="theme-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Portfolio</h3>
              <span className="text-xs theme-muted">{portfolioUrls.length}/7</span>
            </div>

            {/* Existing images with remove button */}
            {portfolioUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {portfolioUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={resolveImageUrl(url)}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      onError={e => { (e.target as HTMLImageElement).src = "/placeholder-avatar.jpg"; }}
                    />
                    {/* Remove button — always visible on mobile, hover on desktop */}
                    <button
                      type="button"
                      onClick={() => void removePortfolioImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Remove image"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {portfolioUrls.length < 7 && (
              <label className={`block w-full cursor-pointer rounded-xl border border-dashed px-4 py-3 text-center text-sm theme-muted hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors ${uploadingGallery ? "opacity-50 pointer-events-none" : ""}`}>
                {uploadingGallery
                  ? "Uploading..."
                  : `+ Add images (${7 - portfolioUrls.length} remaining)`}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  onChange={handlePortfolioUpload}
                  className="hidden"
                  disabled={uploadingGallery}
                />
              </label>
            )}

            {portfolioUrls.length >= 7 && (
              <p className="text-xs theme-muted text-center">Portfolio full — remove an image to add more</p>
            )}
          </div>

          {/* Live preview */}
          <div className="theme-card rounded-xl p-6">
            <h3 className="font-semibold mb-4">Live Preview</h3>
            <div className="text-center space-y-2">
              <img
                src={profileImagePreview || "/placeholder-avatar.jpg"}
                className="w-14 h-14 rounded-full object-cover shadow-lg border-2 border-[var(--surface)] mx-auto"
                alt="Preview"
              />
              <p className="font-semibold">{form.businessName || "Your Business"}</p>
              <p className="text-sm theme-muted line-clamp-2">{form.description || "Your description"}</p>
              <p className="text-xs theme-muted">{form.location}</p>
              {form.experience && (
                <p className="text-xs bg-[var(--surface)] px-2 py-1 rounded-full inline-block">{form.experience} years exp.</p>
              )}
              <p className="text-xs theme-muted">{packages.length} package{packages.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
