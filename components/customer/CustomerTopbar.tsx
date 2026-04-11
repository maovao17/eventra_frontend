"use client";

import { useAuth } from "@/context/AuthContext";

export default function CustomerTopbar() {
  const { profile, logout } = useAuth();

  return (
    <div className="theme-card flex items-center justify-between rounded-none border-x-0 border-t-0 px-8 py-4 shadow-none">

      <input
        type="text"
        placeholder="Search vendors..."
        className="input w-80"
      />

      <div className="flex items-center gap-4">

        <button className="theme-muted transition hover:text-[var(--primary)]">
          🔔
        </button>

        <div className="flex items-center gap-2">
          <img
            src="/placeholder-avatar.jpg"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium">
            {profile?.name || "User"}
          </span>
          <button
            onClick={logout}
            className="text-sm theme-muted hover:text-red-500 px-2 py-1 rounded transition"
          >
            Logout
          </button>
        </div>

      </div>

    </div>
  );
}
