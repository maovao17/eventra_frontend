"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import ServiceCard from "@/components/event/ServiceCard";
import { discoverableServices, templateServices } from "@/app/lib/mock-data";

export default function CreateEventPage() {
  const params = useSearchParams();
  const selectedTemplate = params.get("type") ?? "Custom";
  const [services, setServices] = useState(templateServices[selectedTemplate] ?? ["Venue", "Catering"]);
  const [showAdd, setShowAdd] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");

  const progress = useMemo(() => Math.min(100, Math.round((services.length / 8) * 100)), [services.length]);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.5fr_1fr]">
      <section className="space-y-6">
        <h1 className="text-3xl font-bold">{selectedTemplate} Event Planner</h1>
        <div className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2">
          <input className="input" placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
          <input className="input" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          <input className="input" placeholder="Location" />
          <input className="input" placeholder="Budget" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Services</h2><button onClick={() => setShowAdd(true)} className="text-sm font-medium text-orange-600">+ Add Service</button></div>
          <AnimatePresence>{services.map((service) => <ServiceCard key={service} service={service} removeService={() => setServices((prev) => prev.filter((item) => item !== service))} />)}</AnimatePresence>
        </div>

        {showAdd && (
          <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 p-5">
            <div className="w-full max-w-md rounded-2xl bg-white p-5">
              <h3 className="font-semibold">Add a service</h3>
              <div className="mt-3 grid gap-2">{discoverableServices.map((service) => <button key={service} onClick={() => { setServices((prev) => (prev.includes(service) ? prev : [...prev, service])); setShowAdd(false); }} className="rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50">{service}</button>)}</div>
              <button onClick={() => setShowAdd(false)} className="mt-4 text-sm text-slate-500">Close</button>
            </div>
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="glass-card p-5"><h3 className="font-semibold">Event Progress</h3><p className="mt-2 text-sm text-slate-600">Venue booked · Photographer pending · Catering pending</p><div className="mt-3 h-2 rounded-full bg-slate-100"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full bg-orange-500" /></div></div>
        <div className="glass-card p-5"><h3 className="font-semibold">Budget Tracker</h3><p className="mt-2 text-sm text-slate-500">Budget ₹1,00,000 · Used ₹40,000 · Remaining ₹60,000</p><div className="mt-3 h-2 rounded-full bg-slate-100"><motion.div initial={{ width: 0 }} animate={{ width: "40%" }} className="h-full rounded-full bg-emerald-500" /></div></div>
        <div className="glass-card p-5"><h3 className="font-semibold">Collaborators</h3><input className="input mt-3" placeholder="Invite by email" /><button className="mt-2 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white">Send Invite</button></div>
      </aside>
    </div>
  );
}
