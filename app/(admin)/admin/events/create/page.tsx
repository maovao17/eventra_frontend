"use client";

import { CalendarDays, MapPin, Upload, Users } from "lucide-react";

export default function CreateEvent() {
  return (
    <div>

      {/* Page Header */}
      <p className="theme-primary text-sm font-semibold mb-1">
        ADMIN OVERVIEW
      </p>

      <h1 className="text-3xl font-bold mb-1">
        Create New Event
      </h1>

      <p className="theme-muted mb-6">
        Add a new event to the Eventra platform. Fill in the details below to
        publish the event for organizers and participants.
      </p>


      {/* Form Card */}
      <div className="theme-card p-8">

        <div className="grid grid-cols-2 gap-6">

          {/* Event Name */}
          <div className="col-span-2">
            <label className="text-sm font-medium">
              Event Title
            </label>

            <input
              type="text"
              placeholder="Enter event title"
              className="mt-2 w-full border rounded-lg px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
          </div>


          {/* Organizer */}
          <div>
            <label className="text-sm font-medium">
              Organizer Name
            </label>

            <input
              type="text"
              placeholder="Organizer or company"
              className="mt-2 w-full border rounded-lg px-4 py-3 outline-none focus:border-[var(--primary)]"
            />
          </div>


          {/* Event Category */}
          <div>
            <label className="text-sm font-medium">
              Event Category
            </label>

            <select className="mt-2 w-full border rounded-lg px-4 py-3 outline-none">

              <option>Wedding</option>
              <option>Corporate</option>
              <option>Festival</option>
              <option>Conference</option>
              <option>Concert</option>

            </select>
          </div>


          {/* Date */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <CalendarDays size={16} /> Event Date
            </label>

            <input
              type="date"
              className="mt-2 w-full border rounded-lg px-4 py-3 outline-none"
            />
          </div>


          {/* Location */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin size={16} /> Venue / Location
            </label>

            <input
              type="text"
              placeholder="Enter venue location"
              className="mt-2 w-full border rounded-lg px-4 py-3 outline-none"
            />
          </div>


          {/* Attendees */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Users size={16} /> Expected Attendees
            </label>

            <input
              type="number"
              placeholder="Number of attendees"
              className="mt-2 w-full border rounded-lg px-4 py-3 outline-none"
            />
          </div>


          {/* Status */}
          <div>
            <label className="text-sm font-medium">
              Event Status
            </label>

            <select className="mt-2 w-full border rounded-lg px-4 py-3 outline-none">

              <option>Upcoming</option>
              <option>Ongoing</option>
              <option>Completed</option>

            </select>
          </div>


          {/* Description */}
          <div className="col-span-2">
            <label className="text-sm font-medium">
              Event Description
            </label>

            <textarea
              rows={4}
              placeholder="Write a short description of the event..."
              className="mt-2 w-full border rounded-lg px-4 py-3 outline-none"
            />
          </div>


          {/* Image Upload */}
          <div className="col-span-2">

            <label className="text-sm font-medium">
              Event Banner Image
            </label>

            <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center theme-muted">

              <Upload size={24} className="mx-auto mb-2" />

              <p>
                Drag & drop event banner or click to upload
              </p>

            </div>

          </div>

        </div>


        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-8">

          <button className="px-6 py-3 border rounded-lg">
            Cancel
          </button>

          <button className="px-6 py-3 bg-[var(--primary)] text-white rounded-lg">
            Create Event
          </button>

        </div>

      </div>

    </div>
  );
}
