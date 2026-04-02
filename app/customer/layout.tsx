"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { ProtectedLayoutLoading } from "@/components/ui/PageState"
import { useAuth } from "@/context/AuthContext"
import { getDashboardPathForRole } from "@/lib/routes"

const links = [
  { href: "/customer/dashboard", label: "Dashboard" },
  { href: "/customer/templates", label: "Templates" },
  { href: "/customer/events", label: "My Events" },
  { href: "/customer/vendors", label: "Vendors" },
  { href: "/customer/messages", label: "Messages" },
  { href: "/customer/checkout", label: "Checkout" },
  { href: "/customer/budgetTracker", label: "Budget" },
]

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!profile) {
      router.replace("/login")
      return
    }

    if (profile.role !== "customer") {
      router.replace(getDashboardPathForRole(profile.role))
    }
  }, [loading, profile, router])

  if (loading || !profile || profile.role !== "customer") {
    return (
      <ProtectedLayoutLoading
        title="Preparing your planning workspace"
        subtitle="We're checking your account and loading your latest event activity."
      />
    )
  }

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
