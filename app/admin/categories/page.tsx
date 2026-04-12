"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/context/ToastContext";
import { Layers, Trash2, Plus } from "lucide-react";

type ServiceRecord = {
  _id: string;
  name: string;
  category: string;
  price?: number;
  vendor_Id?: string;
};

type CategoryGroup = {
  name: string;
  services: ServiceRecord[];
};

export default function CategoriesPage() {
  const { showToast } = useToast();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadServices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/services?limit=200");
      setServices(Array.isArray(res) ? res : []);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Could not load services.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadServices();
  }, []);

  const handleDelete = async (serviceId: string) => {
    setDeletingId(serviceId);
    try {
      await apiFetch(`/services/${serviceId}`, { method: "DELETE" });
      setServices((current) => current.filter((s) => s._id !== serviceId));
      showToast("Service deleted.", "success");
    } catch (fetchError) {
      showToast(fetchError instanceof Error ? fetchError.message : "Could not delete service.", "error");
    } finally {
      setDeletingId("");
    }
  };

  const handleCreate = async () => {
    if (!newServiceName.trim() || !newCategory.trim()) {
      showToast("Name and category are required.", "error");
      return;
    }
    const price = Number(newPrice);
    if (newPrice && (isNaN(price) || price < 0)) {
      showToast("Enter a valid price.", "error");
      return;
    }

    setCreating(true);
    try {
      const created = await apiFetch("/services", {
        method: "POST",
        body: JSON.stringify({
          name: newServiceName.trim(),
          category: newCategory.trim(),
          price: newPrice ? price : 0,
          location: {},
        }),
      });
      setServices((current) => [...current, created as ServiceRecord]);
      setNewServiceName("");
      setNewCategory("");
      setNewPrice("");
      setShowForm(false);
      showToast("Service created.", "success");
    } catch (fetchError) {
      showToast(fetchError instanceof Error ? fetchError.message : "Could not create service.", "error");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <PageCardSkeleton count={4} className="md:grid-cols-2" />;
  if (error) {
    return (
      <ErrorState
        title="We couldn't load categories."
        description="Retry to fetch available service categories."
        onRetry={() => void loadServices()}
        retryLabel="Retry"
      />
    );
  }

  // Group services by category
  const categoryMap: Record<string, ServiceRecord[]> = {};
  services.forEach((service) => {
    const cat = service.category || "Uncategorized";
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(service);
  });

  const categoryGroups: CategoryGroup[] = Object.entries(categoryMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, svcs]) => ({ name, services: svcs }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Categories</h1>
          <p className="theme-muted">
            Manage service categories and offerings on the platform. {services.length} services across {categoryGroups.length} categories.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {showForm && (
        <div className="theme-card p-6 space-y-3">
          <h2 className="font-semibold text-lg">New Service</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="Service name"
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category (e.g. Photography)"
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
            <input
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Base price (₹)"
              type="number"
              min={0}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="rounded-xl bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Service"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border px-5 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {categoryGroups.length === 0 ? (
        <EmptyState
          title="No services found"
          description="Add the first service to get started."
          actionLabel="Add Service"
        />
      ) : (
        <div className="space-y-6">
          {categoryGroups.map((group) => (
            <div key={group.name} className="theme-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={18} className="text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">{group.name}</h2>
                <span className="ml-2 text-xs theme-muted rounded-full border px-2 py-0.5">
                  {group.services.length} {group.services.length === 1 ? "service" : "services"}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {group.services.map((service) => (
                  <div
                    key={service._id}
                    className="flex items-center justify-between rounded-xl border p-3"
                  >
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      {typeof service.price === "number" && service.price > 0 && (
                        <p className="theme-muted text-xs">
                          ₹{service.price.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(service._id)}
                      disabled={deletingId === service._id}
                      className="rounded-full p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"
                      title="Delete service"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
