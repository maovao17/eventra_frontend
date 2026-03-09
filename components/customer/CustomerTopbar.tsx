"use client";

import { Bell } from "lucide-react";
import { useAuth } from "@/app/lib/auth";

export default function CustomerTopbar() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Customer workspace</p>
        <h1 className="text-lg font-semibold">Welcome back, {user?.name ?? "Planner"}</h1>
      </div>
      <button className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100">
        <Bell size={18} />
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
      </button>
    </header>
  );
}
