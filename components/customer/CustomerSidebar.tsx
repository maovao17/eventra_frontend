"use client";

import Image from "next/image";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="theme-card w-64 rounded-none border-y-0 border-l-0 p-6">

      <div className="mb-10 flex items-center gap-3">
        <Image
          src="/logo.jpeg"
          alt="Eventra"
          width={36}
          height={36}
          className="h-9 w-9 rounded-lg object-cover"
        />
        <h1 className="theme-primary text-xl font-bold">
          Eventra
        </h1>
      </div>

      <nav className="flex flex-col gap-3">
        <Link className="group rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/20" href="/customer/dashboard">Dashboard</Link>
        <Link className="group rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/20" href="/customer/templates">Templates</Link>
        <Link className="group rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/20" href="/customer/vendors">Vendors</Link>
        <Link className="group rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/20" href="/customer/messages">Messages</Link>
        <Link className="group rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/20" href="/customer/events">My Events</Link>
        <Link className="group rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-[var(--primary-light)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-primary/20" href="/customer/payment">Payments</Link>
      </nav>
    </aside>
  );
}
