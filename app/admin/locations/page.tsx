"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/context/ToastContext";
import { MapPin, Users } from "lucide-react";

type LocationStat = {
  city: string;
  vendorCount: number;
  eventCount: number;
  vendors: string[];
};

export default function LocationsPage() {
  const { showToast } = useToast();
  const [locationStats, setLocationStats] = useState<LocationStat[]>([]);
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLocations = async () => {
    setLoading(true);
    setError("");

    try {
      const [vendorsRes, eventsRes] = await Promise.all([
        apiFetch("/admin/vendors"),
        apiFetch("/admin/events"),
      ]);

      const vendors = Array.isArray(vendorsRes) ? vendorsRes : [];
      const events = Array.isArray(eventsRes) ? eventsRes : [];

      setTotalVendors(vendors.length);
      setTotalEvents(events.length);

      // Aggregate vendor locations
      const cityMap: Record<string, { vendorCount: number; eventCount: number; vendors: string[] }> = {};

      vendors.forEach((vendor: any) => {
        const city =
          vendor.location?.city ||
          vendor.location?.area ||
          (typeof vendor.location === "string" ? vendor.location : null) ||
          "Unknown";

        const normalizedCity = city.trim() || "Unknown";

        if (!cityMap[normalizedCity]) {
          cityMap[normalizedCity] = { vendorCount: 0, eventCount: 0, vendors: [] };
        }
        cityMap[normalizedCity].vendorCount += 1;
        if (vendor.businessName) {
          cityMap[normalizedCity].vendors.push(vendor.businessName);
        }
      });

      // Aggregate event locations
      events.forEach((event: any) => {
        const rawLocation = event.location;
        const city =
          (typeof rawLocation === "object"
            ? rawLocation?.city || rawLocation?.label || rawLocation?.address
            : rawLocation) || "Unknown";

        const normalizedCity = String(city).trim() || "Unknown";

        if (!cityMap[normalizedCity]) {
          cityMap[normalizedCity] = { vendorCount: 0, eventCount: 0, vendors: [] };
        }
        cityMap[normalizedCity].eventCount += 1;
      });

      const stats: LocationStat[] = Object.entries(cityMap)
        .map(([cityName, data]) => ({ city: cityName, ...data }))
        .sort((a, b) => b.vendorCount + b.eventCount - (a.vendorCount + a.eventCount));

      setLocationStats(stats);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Could not load locations.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLocations();
  }, []);

  if (loading) return <PageCardSkeleton count={4} className="md:grid-cols-2" />;
  if (error) {
    return (
      <ErrorState
        title="We couldn't load locations."
        description="Retry to fetch vendor and event location data."
        onRetry={() => void loadLocations()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Locations</h1>
        <p className="theme-muted">
          Geographic breakdown of vendors and events across the platform.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="theme-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-[var(--primary)]" />
            <p className="text-sm font-medium">Unique Locations</p>
          </div>
          <p className="text-3xl font-bold">{locationStats.length}</p>
        </div>
        <div className="theme-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-[var(--primary)]" />
            <p className="text-sm font-medium">Total Vendors</p>
          </div>
          <p className="text-3xl font-bold">{totalVendors}</p>
        </div>
        <div className="theme-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-[var(--primary)]" />
            <p className="text-sm font-medium">Total Events</p>
          </div>
          <p className="text-3xl font-bold">{totalEvents}</p>
        </div>
      </div>

      {locationStats.length === 0 ? (
        <EmptyState
          title="No location data"
          description="Location data will appear once vendors and events are added to the platform."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {locationStats.map((loc) => (
            <div key={loc.city} className="theme-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[var(--primary)]" />
                  <h3 className="font-semibold">{loc.city}</h3>
                </div>
                <div className="flex gap-3 text-sm theme-muted">
                  {loc.vendorCount > 0 && (
                    <span>{loc.vendorCount} {loc.vendorCount === 1 ? "vendor" : "vendors"}</span>
                  )}
                  {loc.eventCount > 0 && (
                    <span>{loc.eventCount} {loc.eventCount === 1 ? "event" : "events"}</span>
                  )}
                </div>
              </div>

              {/* Progress bars */}
              {totalVendors > 0 && loc.vendorCount > 0 && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs theme-muted mb-1">
                    <span>Vendor coverage</span>
                    <span>{Math.round((loc.vendorCount / totalVendors) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-[var(--primary)]"
                      style={{ width: `${(loc.vendorCount / totalVendors) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {loc.vendors.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {loc.vendors.slice(0, 4).map((name) => (
                    <span key={name} className="text-xs border rounded-full px-2 py-0.5 theme-muted">
                      {name}
                    </span>
                  ))}
                  {loc.vendors.length > 4 && (
                    <span className="text-xs border rounded-full px-2 py-0.5 theme-muted">
                      +{loc.vendors.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
