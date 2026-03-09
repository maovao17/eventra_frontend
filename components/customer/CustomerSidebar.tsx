"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r p-6">

      <h1 className="text-xl font-bold text-[#E87D5F] mb-10">
        Eventra
      </h1>

      <nav className="flex flex-col gap-4">

        <Link href="/dashboard">Dashboard</Link>

        <Link href="/templates">Templates</Link>

        <Link href="/vendors">Vendors</Link>

        <Link href="/messages">Messages</Link>

        <Link href="/events">My Events</Link>

        <Link href="/payments">Payments</Link>

      </nav>

    </aside>
  );
}