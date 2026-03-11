export default function QuickActions() {
  return (
    <div className="theme-card p-6">

      <h2 className="font-semibold text-lg mb-4">
        Quick Actions
      </h2>

      <button className="bg-[var(--primary)] text-white w-full py-3 rounded-lg mb-3">
        + Add New Service Package
      </button>

      <button className="border w-full py-3 rounded-lg mb-3">
        View Booking Requests
      </button>

      <button className="border w-full py-3 rounded-lg">
        Update Availability
      </button>

      <div className="mt-6">

        <p className="text-sm theme-muted">
          Availability Status
        </p>

        <div className="flex justify-between mt-2">

          <span>Open for New Bookings</span>

          <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
            Active
          </span>

        </div>

      </div>

    </div>
  );
}