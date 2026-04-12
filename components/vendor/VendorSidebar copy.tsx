"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function VendorSidebar() {
  const { logout } = useAuth();

  return (
    <div className="w-64 theme-card theme-border border-r h-screen flex flex-col">

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

      <nav className="flex flex-col text-sm gap-1">

        <Link href="/vendor/dashboard" className="group rounded-xl px-5 py-3 font-medium transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/20">
          Dashboard
        </Link>

        <Link href="/vendor/requests" className="group rounded-xl px-5 py-3 font-medium transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/20">
          Booking Requests
        </Link>

        <Link href="/vendor/events" className="group rounded-xl px-5 py-3 font-medium transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/20">
          Upcoming Events
        </Link>

        <Link href="/vendor/messages" className="group rounded-xl px-5 py-3 font-medium transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/20">
          Messages
        </Link>

        <Link href="/vendor/earnings" className="group rounded-xl px-5 py-3 font-medium transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/20">
          Earnings & Analytics
        </Link>

        <Link href="/vendor/ratings" className="group rounded-xl px-5 py-3 font-medium transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/20">
          Reviews & Ratings
        </Link>

      </nav>

      <div className="mt-6">
        <p className="px-6 text-xs theme-muted mb-2">
          SETTINGS
        </p>

        <Link href="/vendor/businessProfile" className="block rounded-xl px-5 py-3 text-sm font-medium hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-all">
          Business Profile
        </Link>

        <Link href="/vendor/services" className="block rounded-xl px-5 py-3 text-sm font-medium hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-all">
          Services
        </Link>

        <Link href="/vendor/reminders" className="block rounded-xl px-5 py-3 text-sm font-medium hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-all">
          Notifications
        </Link>
      </div>

      <div className="mt-auto border-t p-4">
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium theme-muted hover:text-red-500 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

    </div>
  );
}
