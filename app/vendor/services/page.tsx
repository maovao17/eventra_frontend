"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import { assignVendorServices, getAllServices, getVendorMe } from "@/app/lib/vendorApi";
import { CheckSquare, Plus, Square, Layers } from "lucide-react";

type ServiceRecord = {
  _id: string;
  name: string;
  category: string;
  price?: number;
};

export default function ServicesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const userId = user?.uid || profile?.uid;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const loadServices = async () => {
    if (!userId || authLoading || !profile || hasFetched) return;
    setHasFetched(true);

    const [serviceResponse, vendorResponse] = await Promise.all([
      getAllServices(),
      getVendorMe(),
    ]);

    if (!(serviceResponse as any)?.error && Array.isArray(serviceResponse)) {
      setServices(serviceResponse);
    }

    if (!(vendorResponse as any)?.error) {
      const ids = Array.isArray((vendorResponse as any)?.servicesOffered)
        ? (vendorResponse as any).servicesOffered.map((item: unknown) => String(item))
        : [];
      setSelectedServiceIds(ids);
    }
  };

  useEffect(() => {
    void loadServices();
  }, [userId]);

  const selectedCount = useMemo(() => selectedServiceIds.length, [selectedServiceIds]);

  const handleCreateService = async () => {
    setError("");
    setSuccess("");

    if (!userId || authLoading || !profile) {
      setError("Please wait for profile to load.");
      return;
    }

    if (!name || !category || !price) {
      setError("Name, category, and price are required.");
      return;
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      setError("Enter a valid numeric price.");
      return;
    }

    setLoading(true);

    const vendor = await getVendorMe();
    if ((vendor as any)?.error || !(vendor as any)?._id) {
      setError((vendor as any)?.message || "Vendor not found for current user.");
      setLoading(false);
      return;
    }

    const created = await apiFetch("/services", {
      method: "POST",
      body: JSON.stringify({
        name,
        category,
        price: numericPrice,
        location: {},
        vendor_Id: (vendor as any)._id,
      }),
    });

    if ((created as any)?.error) {
      setError((created as any).message || "Could not create service.");
      setLoading(false);
      return;
    }

    setSuccess("Service created successfully.");
    setName("");
    setCategory("");
    setPrice("");
    setShowForm(false);
    setHasFetched(false);
    await loadServices();
    setLoading(false);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  };

  const handleAssignServices = async () => {
    if (!userId || authLoading || !profile) return;

    setAssigning(true);
    setError("");
    setSuccess("");

    const response = await assignVendorServices(selectedServiceIds);
    if ((response as any)?.error) {
      setError((response as any).message || "Could not assign services.");
      setAssigning(false);
      return;
    }

    setSuccess("Services updated successfully.");
    setAssigning(false);
  };

  // Group by category
  const categoryGroups = useMemo(() => {
    const map: Record<string, ServiceRecord[]> = {};
    services.forEach((s) => {
      const cat = s.category || "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [services]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Services</h1>
          <p className="theme-muted">
            Select services you offer, or add custom ones. Customers discover you based on your selected services.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
        >
          <Plus size={16} />
          Add Custom Service
        </button>
      </div>

      {/* Create service form */}
      {showForm && (
        <div className="theme-card p-6 space-y-4">
          <h2 className="font-semibold">New Custom Service</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={name}
              placeholder="Service name"
              onChange={(e) => setName(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
            <input
              value={category}
              placeholder="Category (e.g. Photography)"
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
            <input
              value={price}
              placeholder="Price (₹)"
              type="number"
              min={0}
              onChange={(e) => setPrice(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCreateService}
              disabled={loading}
              className="rounded-xl bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Service"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(""); setSuccess(""); }}
              className="rounded-xl border px-5 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Service selection */}
      <div className="theme-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold">Available Services</h2>
            <p className="theme-muted text-sm mt-0.5">
              {selectedCount} of {services.length} selected
            </p>
          </div>
          <button
            type="button"
            onClick={handleAssignServices}
            disabled={assigning}
            className="rounded-xl border px-5 py-2 text-sm font-medium disabled:opacity-60"
          >
            {assigning ? "Saving..." : "Save Selection"}
          </button>
        </div>

        {error && !showForm && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && !showForm && <p className="text-green-600 text-sm mb-4">{success}</p>}

        {services.length === 0 ? (
          <p className="theme-muted text-sm">No services available yet.</p>
        ) : (
          <div className="space-y-6">
            {categoryGroups.map(([cat, catServices]) => (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={14} className="text-[var(--primary)]" />
                  <span className="text-sm font-semibold">{cat}</span>
                  <span className="text-xs theme-muted">
                    ({catServices.filter((s) => selectedServiceIds.includes(s._id)).length}/{catServices.length} selected)
                  </span>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {catServices.map((service) => {
                    const isSelected = selectedServiceIds.includes(service._id);
                    return (
                      <button
                        key={service._id}
                        type="button"
                        onClick={() => toggleService(service._id)}
                        className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--primary)]/5"
                            : "hover:border-gray-400"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">{service.name}</p>
                          {typeof service.price === "number" && service.price > 0 && (
                            <p className="theme-muted text-xs">
                              ₹{service.price.toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>
                        {isSelected ? (
                          <CheckSquare size={18} className="text-[var(--primary)] shrink-0" />
                        ) : (
                          <Square size={18} className="theme-muted shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
