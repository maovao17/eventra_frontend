"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, LayoutGrid, LogOut, User, Users } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPathForRole } from "@/lib/routes";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [open, setOpen] = useState(false);

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutGrid size={18} /> },
    { name: "Vendors", path: "/admin/vendors", icon: <User size={18} /> },
    { name: "Users", path: "/admin/users", icon: <Users size={18} /> },
    { name: "Events", path: "/admin/events", icon: <CalendarDays size={18} /> },
  ];

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace("/login");
      return;
    }
    if (profile.role !== "admin") {
      router.replace(getDashboardPathForRole(profile.role));
    }
  }, [loading, profile, router]);

  if (loading || !profile || profile.role !== "admin") {
    return <div className="flex min-h-screen items-center justify-center">Loading admin workspace...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">

      {/* Sidebar */}
      <div className="theme-card w-64 rounded-none border-y-0 border-l-0 flex flex-col justify-between">

        <div className="p-6">

          <nav className="space-y-2">

            {menu.map((item) => (

              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition
                ${
                  pathname === item.path || pathname.startsWith(`${item.path}/`)
                    ? "bg-[var(--primary)] text-white"
                    : "theme-muted hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
                }`}
              >

                <div className="flex items-center gap-3">

                  <span className="text-lg">{item.icon}</span>

                  {item.name}

                </div>

                {(pathname === item.path || pathname.startsWith(`${item.path}/`)) && <span>›</span>}

              </Link>

            ))}

          </nav>

        </div>

        <button
          type="button"
          onClick={() => void signOut(auth)}
          className="p-6 border-t flex items-center gap-2 theme-muted hover:text-red-500 cursor-pointer text-left"
        >

          <LogOut size={18} />

          Logout

        </button>

      </div>


      {/* Right Section */}
      <div className="flex-1 flex flex-col">

        {/* Top Navbar */}
        <div className="theme-card rounded-none border-x-0 border-t-0 px-8 py-4 shadow-none flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpeg"
              alt="Eventra"
              width={32}
              height={32}
              className="w-8 h-8"
            />

            <h1 className="text-xl font-semibold theme-primary">
              Eventra
            </h1>

          </div>


          {/* Profile Section */}
          <div className="relative">

            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3"
            >

              <div className="text-right">

                <p className="text-sm font-semibold">
                  {profile.name}
                </p>

                <p className="text-xs theme-muted">
                  Admin
                </p>

              </div>

              <div className="w-8 h-8 bg-[var(--primary-light)] theme-primary rounded-full flex items-center justify-center font-semibold">
                {profile.name?.charAt(0)?.toUpperCase() || "A"}
              </div>

            </button>


            {/* Popup */}
            {open && (

              <div className="absolute right-0 mt-3 w-60 theme-card rounded-xl shadow-lg border p-4">

                {/* Profile Info */}
                <div className="flex items-center gap-3 border-b pb-3">

                  <div className="w-10 h-10 bg-[var(--primary-light)] theme-primary rounded-full flex items-center justify-center font-semibold">
                    A
                  </div>

                  <div>

                    <p className="font-medium">
                      {profile.name}
                    </p>

                    <p className="text-sm theme-muted">
                      {profile.phone || "No phone number"}
                    </p>

                  </div>

                </div>


                

              </div>

            )}

          </div>

        </div>


        {/* Page Content */}
        <div className="p-10">
          {children}
        </div>

      </div>

    </div>
  );
}
