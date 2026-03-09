"use client";

import { motion } from "framer-motion";

const events = [
  { name: "Wedding Event", date: "12 Dec 2026", location: "Mumbai", booked: "3 / 6", budget: "₹75k / ₹1L" },
  { name: "Corporate Mixer", date: "20 Jan 2027", location: "Bengaluru", booked: "2 / 5", budget: "₹1.4L / ₹3L" },
];

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="text-3xl font-bold">Event Dashboard</h1>
      <div className="grid gap-5 md:grid-cols-2">{events.map((event, index)=><motion.article key={event.name} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:index*0.08}} className="glass-card p-5"><h3 className="text-xl font-semibold">{event.name}</h3><p className="mt-1 text-sm text-slate-500">{event.date} · {event.location}</p><p className="mt-3 text-sm">Services booked: <span className="font-semibold">{event.booked}</span></p><p className="text-sm">Budget used: <span className="font-semibold">{event.budget}</span></p></motion.article>)}</div>
    </div>
  );
}
