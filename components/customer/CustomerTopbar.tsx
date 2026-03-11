"use client";

export default function CustomerTopbar() {
  return (
    <div className="theme-card flex items-center justify-between rounded-none border-x-0 border-t-0 px-8 py-4 shadow-none">

      <input
        type="text"
        placeholder="Search vendors..."
        className="input w-80 px-4 py-2"
      />

      <div className="flex items-center gap-4">

        <button className="theme-muted transition hover:text-[var(--primary)]">
          🔔
        </button>

        <div className="flex items-center gap-2">
          <img
            src="/avatar.jpg"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium">
            Sarah
          </span>
        </div>

      </div>

    </div>
  );
}
