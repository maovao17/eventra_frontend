import Image from "next/image";
import Link from "next/link";

export default function VendorSidebar() {
  return (
    <div className="w-64 theme-card theme-border border-r h-screen">

      <div className="flex items-center gap-3 p-6">
        <Image
          src="/logo.jpeg"
          alt="Eventra"
          width={36}
          height={36}
          className="h-9 w-9 rounded-lg object-cover"
        />
        <div className="text-xl font-bold theme-primary">
          Eventra
        </div>
      </div>

      <p className="px-6 text-xs theme-muted mb-2">
        MAIN MENU
      </p>

      <nav className="flex flex-col text-sm">

        <Link href="/vendor/dashboard" className="px-6 py-3 hover:theme-surface">
          Dashboard
        </Link>

        <Link href="/vendor/requests" className="px-6 py-3 hover:theme-surface">
          Booking Requests
        </Link>

        <Link href="/vendor/events" className="px-6 py-3 hover:theme-surface">
          Upcoming Events
        </Link>

        <Link href="/vendor/messages" className="px-6 py-3 hover:theme-surface">
          Messages
        </Link>

        <Link href="/vendor/earnings" className="px-6 py-3 hover:theme-surface">
          Earnings & Analytics
        </Link>

        <Link href="/vendor/ratings" className="px-6 py-3 hover:theme-surface">
          Reviews & Ratings
        </Link>

      </nav>

      <div className="mt-10">

        <p className="px-6 text-xs theme-muted mb-2">
          SETTINGS
        </p>

        <Link href="/vendor/businessProfile" className="block px-6 py-3 hover:theme-surface">
          Business Profile
        </Link>

        <Link href="/vendor/reminders" className="block px-6 py-3 hover:theme-surface">
          Notifications
        </Link>

      </div>

      <div className="absolute bottom-6 px-6">
        <button className="border border-[var(--primary)] theme-primary px-4 py-2 rounded-lg">
          + Add Package
        </button>
      </div>

    </div>
  );
}
