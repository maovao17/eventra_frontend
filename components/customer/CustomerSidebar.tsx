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

      <nav className="flex flex-col gap-4">
        <Link className="rounded-lg px-3 py-2 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]" href="/dashboard">Dashboard</Link>
        <Link className="rounded-lg px-3 py-2 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]" href="/templates">Templates</Link>
        <Link className="rounded-lg px-3 py-2 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]" href="/vendors">Vendors</Link>
        <Link className="rounded-lg px-3 py-2 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]" href="/messages">Messages</Link>
        <Link className="rounded-lg px-3 py-2 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]" href="/events">My Events</Link>
        <Link className="rounded-lg px-3 py-2 transition hover:bg-[var(--primary-light)] hover:text-[var(--primary)]" href="/payment">Payments</Link>
      </nav>
    </aside>
  );
}
