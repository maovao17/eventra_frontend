"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import type { ReactNode } from "react"

const links = [
  { href: "/templates", label: "Templates" },
  { href: "/events", label: "My Events" },
  { href: "/vendors", label: "Vendors" },
  { href: "/messages", label: "Messages" },
  { href: "/checkout", label: "Checkout" },
  { href: "/budgetTracker", label: "Budget" }
]

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
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

        <nav className="space-y-3">
          {links.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[var(--primary)] text-white shadow-md"
                    : "theme-muted hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex-1 p-10"
      >
        {children}
      </motion.main>
    </div>
  )
}
