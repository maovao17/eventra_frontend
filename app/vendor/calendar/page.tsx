"use client"

import { useEffect, useState } from "react";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import { EmptyState, ErrorState, PageCardSkeleton } from "@/components/ui/PageState";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";

type AvailabilityDate = string;

export default function VendorCalendar() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blockedDates, setBlockedDates] = useState<AvailabilityDate[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    setError("");

    try {
      const vendor: any = await apiFetch("/vendors/me");
      setBlockedDates(vendor.availability?.blockedDates || []);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to load availability.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile?.uid || selectedDates.length === 0) return;
    setSaving(true);
    setError("");

    try {
      const newBlockedDates = [
        ...blockedDates,
        ...selectedDates.map((date) => date.toISOString().split('T')[0])
      ].sort();

      await apiFetch("/vendors/availability", {
        method: "PATCH",
        body: JSON.stringify({
          blockedDates: newBlockedDates,
        }),
      });

      showToast("Availability updated successfully", "success");
      setSelectedDates([]);
      await loadAvailability(); // refresh
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Failed to save availability.";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const modifiers = {
    blocked: blockedDates.map((dateStr) => new Date(dateStr)),
    selected: selectedDates,
  };

  if (loading) {
    return <PageCardSkeleton count={2} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn't load calendar"
        description={error}
        onRetry={loadAvailability}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Availability Calendar</h1>
        <p className="text-muted-foreground">
          Block dates when unavailable. Booked dates are automatically blocked.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <DayPicker
            mode="multiple"
            selected={selectedDates}
            onSelect={(dates) => setSelectedDates(dates || [])}
            modifiers={modifiers}
            disabled={blockedDates.map((dateStr) => new Date(dateStr))}
            required={false}
            className="p-3"
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? <span>{"<"}</span> : <span>{">"}</span>,
            }}
          />
        </div>

        <div className="space-y-6">
          <div className="theme-card p-6">
            <h3 className="font-semibold mb-3">Selected Dates to Block</h3>
            <div className="space-y-2">
              {selectedDates.length === 0 ? (
                <p className="text-muted-foreground text-sm">No dates selected</p>
              ) : (
                selectedDates.map((date, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <span>{date.toLocaleDateString()}</span>
                    <button
                      onClick={() => setSelectedDates(selectedDates.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || selectedDates.length === 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : `Block ${selectedDates.length} date${selectedDates.length !== 1 ? 's' : ''}`}
          </button>

          <div className="theme-card p-4">
            <h4 className="font-semibold mb-2">Already Blocked ({blockedDates.length})</h4>
            <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
              {blockedDates.map((date, index) => (
                <div key={index}>{new Date(date).toLocaleDateString()}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

