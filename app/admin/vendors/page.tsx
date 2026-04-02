"use client";

import { Mail, MapPin, Phone, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/context/ToastContext";

type VendorRecord = {
  _id: string;
  name?: string;
  businessName?: string;
  category?: string[];
  location?: { city?: string; area?: string; address?: string };
  phone?: string;
  email?: string;
  profileImage?: string;
  image?: string;
  isVerified?: boolean;
  verified?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
};

export default function Vendors() {
  const { showToast } = useToast();
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");

  const loadVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch("/admin/vendors");
      setVendors(Array.isArray(response) ? response : []);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Could not load vendors.";
      setError(message);
      setVendors([]);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadVendors();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredVendors = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return vendors;

    return vendors.filter((vendor) => {
      const locationLabel = [vendor.location?.city, vendor.location?.area, vendor.location?.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        String(vendor.businessName || vendor.name || "").toLowerCase().includes(term) ||
        String((vendor.category || []).join(", ")).toLowerCase().includes(term) ||
        locationLabel.includes(term)
      );
    });
  }, [query, vendors]);

  const approveVendor = async (vendorId: string) => {
    setProcessingId(vendorId);
    setError("");
    try {
      await apiFetch(`/admin/vendors/${vendorId}/approve`, { method: "PATCH" });
      setVendors((current) =>
        current.map((item) =>
          item._id === vendorId
            ? { ...item, isVerified: true, verified: true, status: 'approved' as const }
            : item,
        ),
      );
      showToast("Vendor approved.", "success");
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Approval failed.";
      setError(message);
      showToast(message, "error");
    } finally {
      setProcessingId("");
    }
  };

  const rejectVendor = async (vendorId: string) => {
    setProcessingId(vendorId);
    setError("");
    try {
      await apiFetch(`/admin/vendors/${vendorId}/reject`, { method: "PATCH" });
      setVendors((current) =>
        current.map((item) =>
          item._id === vendorId
            ? { ...item, status: 'rejected' as const }
            : item,
        ),
      );
      showToast("Vendor rejected.", "success");
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Rejection failed.";
      setError(message);
      showToast(message, "error");
    } finally {
      setProcessingId("");
    }
  };

  if (loading) {
    return <PageCardSkeleton />;
  }

  if (error && vendors.length === 0) {
    return (
      <ErrorState
        title="We couldn't load vendors."
        description="Retry to review and manage vendor accounts."
        onRetry={() => void loadVendors()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div>

      <h1 className="text-3xl font-bold mb-1">
        Vendor Management
      </h1>

      <p className="theme-muted mb-6">
        Review, filter, and organize your network of event partners.
      </p>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Search */}
      <div className="theme-card p-3 flex items-center gap-3 mb-8">
        <Search size={18} className="theme-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vendors by name, service, or location..."
          className="w-full outline-none"
        />
      </div>

      <div className="grid grid-cols-4 gap-6">

        {/* Filter */}
        <div className="theme-card p-6 h-fit">

          <h3 className="font-semibold mb-4">
            Service Category
          </h3>

          <div className="space-y-3 text-sm">

            <label className="flex justify-between">
              <span>
                <input type="checkbox" className="mr-2" />
                Approved
              </span>
              <span className="theme-primary">{vendors.filter((v) => v.status === 'approved').length}</span>
            </label>

            <label className="flex justify-between">
              <span>
                <input type="checkbox" className="mr-2" />
                Pending
              </span>
              <span className="theme-primary">{vendors.filter((v) => v.status === 'pending').length}</span>
            </label>

            <label className="flex justify-between">
              <span>
                <input type="checkbox" className="mr-2" />
                Rejected
              </span>
              <span className="theme-primary">{vendors.filter((v) => v.status === 'rejected').length}</span>
            </label>

          </div>

        </div>


        {/* Vendor Cards */}
        <div className="col-span-3">

          <h2 className="font-semibold mb-4">
            Available Vendors
            <span className="theme-muted text-sm ml-2">
              (Showing {filteredVendors.length} results)
            </span>
          </h2>

          {filteredVendors.length === 0 ? (
            <EmptyState
              title="No vendors found"
              description="No vendors found. Try another search or retry after new vendors apply."
              secondaryAction={
                <button
                  type="button"
                  onClick={() => void loadVendors()}
                  className="rounded-full border px-5 py-2 text-sm font-medium"
                >
                  Retry
                </button>
              }
            />
          ) : (
          <div className="grid grid-cols-3 gap-6">

            {filteredVendors.map((vendor) => {
              const status = vendor.status || (vendor.isVerified || vendor.verified ? 'approved' : 'pending');
              const statusColor = status === 'approved' ? 'bg-green-100 text-green-800' : status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
              const isApproved = status === 'approved';
              const location = [vendor.location?.city, vendor.location?.area, vendor.location?.address]
                .filter(Boolean)
                .join(" ") || "Location pending";

              return (
                <div
                  key={vendor._id}
                  className="theme-card p-5"
                >

                  <img
                    src={vendor.profileImage || vendor.image || "/eventra_photos/photographer.jpg"}
                    className="rounded-lg mb-4 h-32 w-full object-cover"
                  />

                  <span className={`text-xs ${statusColor} px-3 py-1 rounded-full`}>
                    {status.toUpperCase()}
                  </span>

                  <h3 className="font-semibold mt-3">
                    {vendor.businessName || vendor.name || "Vendor"}
                  </h3>

                  <p className="theme-muted text-sm flex items-center gap-2 mt-2">
                    <MapPin size={16} /> {location}
                  </p>

                  <p className="theme-muted text-sm flex items-center gap-2">
                    <Phone size={16} /> {vendor.phone || "Phone pending"}
                  </p>

                  <p className="theme-muted text-sm flex items-center gap-2">
                    <Mail size={16} /> {vendor.email || "Email pending"}
                  </p>

                  <div className="flex gap-3 mt-4">
                    {status !== 'approved' && (
                      <button
                        onClick={() => void approveVendor(vendor._id)}
                        disabled={processingId === vendor._id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                      >
                        {processingId === vendor._id ? "Approving..." : "Approve"}
                      </button>
                    )}
                    {status !== 'rejected' && (
                      <button
                        onClick={() => void rejectVendor(vendor._id)}
                        disabled={processingId === vendor._id}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                      >
                        {processingId === vendor._id ? "Rejecting..." : "Reject"}
                      </button>
                    )}
                    <button className="border px-4 py-2 rounded-lg text-sm theme-muted">
                      View
                    </button>
                  </div>

                </div>
              );
            })}

          </div>
          )}

        </div>

      </div>

    </div>
  );
}
