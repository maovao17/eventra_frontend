"use client";

export default function CustomerTopbar() {
  return (
    <div className="flex justify-between items-center bg-white border-b px-8 py-4">

      <input
        type="text"
        placeholder="Search vendors..."
        className="border rounded-lg px-4 py-2 w-80"
      />

      <div className="flex items-center gap-4">

        <button className="text-gray-500">
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