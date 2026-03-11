export default function VendorTopbar() {
  return (
    <div className="theme-card border-b px-6 py-4 flex justify-between items-center">

      <input
        placeholder="Search bookings, clients, or services..."
        className="input w-96 px-4 py-2"
      />

      <div className="flex items-center gap-4">

        🔔

        <div className="flex items-center gap-2">

          <div>
            <p className="text-sm font-semibold">
              Anthony D&apos;Souza
            </p>

            <p className="text-xs theme-muted">
              Catering Vendor
            </p>
          </div>

          <img
            src="/eventra_photos/culinary.jpg"
            alt="Vendor profile"
            className="h-10 w-10 rounded-full object-cover"
          />

        </div>

      </div>

    </div>
  );
}
