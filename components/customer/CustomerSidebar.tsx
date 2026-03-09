"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/events", "Event Dashboard"],
  ["/templates", "Templates"],
  ["/events/create", "Event Builder"],
  ["/vendors", "Vendor Discovery"],
  ["/messages", "Messages"],
  ["/checkout", "Checkout"],
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-6 lg:block">
      <Link href="/" className="text-2xl font-bold tracking-tight text-orange-500">Eventra</Link>
      <p className="mt-1 text-sm text-slate-500">Plan beautiful events, together.</p>
      <nav className="mt-8 space-y-2">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={`block rounded-xl px-4 py-2.5 text-sm ${pathname === href ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-100"}`}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
