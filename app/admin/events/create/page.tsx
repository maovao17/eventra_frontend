"use client"

import { CalendarDays, MapPin, Upload, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { apiFetch } from "@/app/lib/api"
import { useToast } from "@/context/ToastContext"

export default function CreateEvent() {
  const router = useRouter()
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    eventType: "Wedding",
    eventDate: "",
    location: "",
    guestCount: "",
    status: "planning",
    budget: "",
  })

  const onChange = (key: string, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleCreate = async () => {
    setSaving(true)

    try {
      await apiFetch("/admin/events", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          eventType: form.eventType,
          eventDate: form.eventDate,
          date: form.eventDate,
          location: { label: form.location },
          guestCount: Number(form.guestCount || 0),
          status: form.status,
          budget: Number(form.budget || 0),
          services: [],
        }),
      })
      showToast("Event created.", "success")
      router.push("/admin/events")
    } catch (fetchError) {
      showToast(fetchError instanceof Error ? fetchError.message : "Could not create event.", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <p className="theme-primary text-sm font-semibold mb-1">
        ADMIN OVERVIEW
      </p>

      <h1 className="text-3xl font-bold mb-1">
        Create New Event
      </h1>

      <p className="theme-muted mb-6">
        Add a live event to the Eventra platform and manage it from the admin panel.
      </p>

      <div className="theme-card p-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="text-sm font-medium">Event Title</label>
            <input
              type="text"
              placeholder="Enter event title"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="mt-2 w-full border rounded-lg px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Organizer Name</label>
            <div className="mt-2 w-full rounded-lg border px-4 py-3 text-sm theme-muted">
              Managed by admin
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Event Category</label>
            <select
              value={form.eventType}
              onChange={(e) => onChange("eventType", e.target.value)}
              className="mt-2 w-full border rounded-lg px-4 py-3 outline-none"
            >
              <option>Wedding</option>
              <option>Corporate</option>
              <option>Festival</option>
              <option>Conference</option>
              <option>Concert</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <CalendarDays size={16} /> Event Date
            </label>
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => onChange("eventDate", e.target.value)}
              className="mt-2 w-full border rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin size={16} /> Venue / Location
            </label>
            <input
              type="text"
              placeholder="Enter venue location"
              value={form.location}
              onChange={(e) => onChange("location", e.target.value)}
              className="mt-2 w-full border rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Users size={16} /> Expected Attendees
            </label>
            <input
              type="number"
              placeholder="Number of attendees"
              value={form.guestCount}
              onChange={(e) => onChange("guestCount", e.target.value)}
              className="mt-2 w-full border rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Budget</label>
            <input
              type="number"
              placeholder="Estimated budget"
              value={form.budget}
              onChange={(e) => onChange("budget", e.target.value)}
              className="mt-2 w-full border rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Event Status</label>
            <select
              value={form.status}
              onChange={(e) => onChange("status", e.target.value)}
              className="mt-2 w-full border rounded-lg px-4 py-3 outline-none"
            >
              <option value="planning">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium">Event Banner Image</label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center theme-muted">
              <Upload size={24} className="mx-auto mb-2" />
              <p>Banner upload can be connected to your media pipeline later.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            className="px-6 py-3 border rounded-lg"
            onClick={() => router.push("/admin/events")}
          >
            Cancel
          </button>

          <button
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg"
            onClick={() => void handleCreate()}
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  )
}
