"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import { assignVendorServices, getAllServices, getVendorMe } from "@/app/lib/vendorApi";

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

    setSuccess("Services updated");
    setAssigning(false);
  };

  return (
    <div className="theme-card p-8">
      <h1 className="text-3xl font-bold">Services</h1>
      <p className="theme-muted mt-2">
        Service management content will appear here.
      </p>

      <div className="mt-6 space-y-3">
        <input
          value={name}
          placeholder="Service name"
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-md p-2"
        />
        <input
          value={category}
          placeholder="Category"
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded-md p-2"
        />
        <input
          value={price}
          placeholder="Price"
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded-md p-2"
        />

        <button
          onClick={handleCreateService}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          {loading ? "Creating..." : "Add Service"}
        </button>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </div>

      <div className="mt-8 space-y-3">
        <p className="font-medium">Available Services ({services.length})</p>
        <p className="text-sm theme-muted">Selected: {selectedCount}</p>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
          {services.map((service) => (
            <label key={service._id} className="flex items-center justify-between border rounded-md p-2">
              <span>
                {service.name} • {service.category}
                {typeof service.price === "number" ? ` • ₹${service.price}` : ""}
              </span>
              <input
                type="checkbox"
                checked={selectedServiceIds.includes(service._id)}
                onChange={() => toggleService(service._id)}
              />
            </label>
          ))}
        </div>

        <button
          onClick={handleAssignServices}
          disabled={assigning}
          className="border px-4 py-2 rounded-md"
        >
          {assigning ? "Saving..." : "Save Selected Services"}
        </button>
      </div>
    </div>
  );
}
