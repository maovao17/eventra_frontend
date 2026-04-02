"use client";

import { useState } from "react";
import { Ellipsis, Filter, MapPin, Search, Users } from "lucide-react";
import Link from "next/link";

const eventsData = [
  {
    title: "Luxe Wedding Showcase 2024",
    status: "Upcoming",
    date: "24",
    month: "AUG",
    description:
      "A premier gathering of top-tier wedding vendors and luxury bridal fashion designers.",
    location: "Grand Ballroom, Ritz Carlton",
    attendees: "450 Registered",
    organizer: "Elegance Events Co.",
  },
  {
    title: "Tech Innovation Summit",
    status: "Ongoing",
    date: "12",
    month: "SEP",
    description:
      "Exploring the next frontier of AI and sustainable technology.",
    location: "Silicon Valley Hub",
    attendees: "1200 Registered",
    organizer: "Future Works",
  },
  {
    title: "Artisanal Food & Wine Festival",
    status: "Upcoming",
    date: "05",
    month: "OCT",
    description:
      "Celebrate the finest local produce and wines in a weekend of tastings.",
    location: "Bordeaux Vineyards",
    attendees: "300 Registered",
    organizer: "Savory Group",
  },
  {
    title: "Corporate Leadership Retreat",
    status: "Completed",
    date: "18",
    month: "JUL",
    description:
      "A three-day retreat focused on emotional intelligence and leadership.",
    location: "Serene Lake Lodge",
    attendees: "85 Registered",
    organizer: "Sarah Mitchell",
  },
  {
    title: "Global Eco-Conservation Forum",
    status: "Upcoming",
    date: "22",
    month: "NOV",
    description:
      "Environmental scientists discussing climate action strategies.",
    location: "United Nations Plaza",
    attendees: "900 Registered",
    organizer: "Green Planet Org",
  },
  {
    title: "Modern Architecture Expo",
    status: "Ongoing",
    date: "30",
    month: "AUG",
    description:
      "Showcasing modern sustainable architecture and design.",
    location: "Design Museum",
    attendees: "620 Registered",
    organizer: "Design Frontiers",
  },
];

export default function EventsPage() {

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredEvents = eventsData.filter((event) => {

    const matchesStatus =
      filter === "All" || event.status === filter;

    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.organizer.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div>

      {/* Title */}
      <p className="theme-primary text-sm font-semibold mb-1">
        ADMIN OVERVIEW
      </p>

      <h1 className="text-3xl font-bold mb-1">
        View Events
      </h1>

      <p className="theme-muted mb-6">
        Monitor and manage all active, upcoming, and past events across
        the Eventra network.
      </p>


      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">

        {/* Search */}
        <div className="theme-card shadow-sm rounded-xl flex items-center gap-3 px-4 py-3 w-[380px]">
          <Search size={18} className="theme-muted" />
          <input
            placeholder="Search events, organizers..."
            className="outline-none w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>


        {/* Filters + Create Button */}
        <div className="flex items-center gap-3">

          <button
            onClick={() => setFilter("All")}
            className={`px-4 py-2 rounded-full text-sm ${
              filter === "All"
                ? "bg-[var(--primary-light)] theme-primary"
                : "theme-muted"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("Upcoming")}
            className={`px-4 py-2 rounded-full text-sm ${
              filter === "Upcoming"
                ? "theme-pill"
                : "theme-muted"
            }`}
          >
            Upcoming
          </button>

          <button
            onClick={() => setFilter("Ongoing")}
            className={`px-4 py-2 rounded-full text-sm ${
              filter === "Ongoing"
                ? "theme-surface text-[var(--text-main)]"
                : "theme-muted"
            }`}
          >
            Ongoing
          </button>

          <button
            onClick={() => setFilter("Completed")}
            className={`px-4 py-2 rounded-full text-sm ${
              filter === "Completed"
                ? "bg-[var(--surface)] theme-muted"
                : "theme-muted"
            }`}
          >
            Completed
          </button>

          <button className="border rounded-lg p-2">
            <Filter size={18} />
          </button>

          <Link href="/admin/events/create">
            <button className="bg-[var(--primary)] text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90">
              + Create Event
            </button>
          </Link>

        </div>

      </div>


      {/* Event Grid */}
      <div className="grid grid-cols-2 gap-6">

        {filteredEvents.map((event, index) => (

          <div
            key={index}
            className="theme-card flex"
          >

            {/* Date */}
            <div className="bg-[var(--primary-light)] w-20 flex flex-col items-center justify-center rounded-l-xl">

              <h2 className="text-2xl font-bold theme-primary">
                {event.date}
              </h2>

              <p className="text-xs theme-muted">
                {event.month}
              </p>

            </div>


            {/* Content */}
            <div className="p-5 flex-1">

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  event.status === "Upcoming"
                    ? "theme-pill"
                    : event.status === "Ongoing"
                    ? "theme-surface text-[var(--text-main)]"
                    : "bg-[var(--surface)] theme-muted"
                }`}
              >
                {event.status}
              </span>

              <div className="flex justify-between items-start mt-2">

                <h3 className="font-semibold text-lg">
                  {event.title}
                </h3>

                <Ellipsis size={18} className="theme-muted" />

              </div>

              <p className="theme-muted text-sm mt-2">
                {event.description}
              </p>

              <div className="flex items-center gap-2 theme-muted text-sm mt-3">

                <MapPin size={16} />
                <p>{event.location}</p>

                <Users size={16} />
                <p>{event.attendees}</p>

              </div>

              <div className="flex justify-between items-center mt-4">

                <p className="text-sm theme-muted">
                  Organized by
                  <span className="font-medium text-[var(--text-main)] ml-1">
                    {event.organizer}
                  </span>
                </p>

                <button className="theme-button px-4 py-2 text-sm">
                  View Details
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
