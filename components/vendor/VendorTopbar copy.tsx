"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getVendorMe, getVendorNotifications } from "@/app/lib/vendorApi";

type VendorTopbarProfile = {
  businessName?: string;
  name?: string;
  category?: string;
  profileImage?: string;
  image?: string;
};

type VendorNotification = {
  _id: string;
  read?: boolean;
};

export default function VendorTopbar() {
  const { profile } = useAuth();
  const [vendor, setVendor] = useState<VendorTopbarProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadVendor = async () => {
      if (!profile?.uid) return;
      const [vendorResponse, notificationResponse] = await Promise.all([
        getVendorMe().catch(() => null),
        getVendorNotifications().catch(() => []),
      ]);
      setVendor((vendorResponse as VendorTopbarProfile | null) ?? null);
      setUnreadCount(
        Array.isArray(notificationResponse)
          ? notificationResponse.filter((item: VendorNotification) => !item?.read).length
          : 0,
      );
    };

    void loadVendor();
  }, [profile?.uid]);

  const displayName = vendor?.businessName || vendor?.name || profile?.name || "Vendor";
  const displayCategory = vendor?.category || "Vendor Service";
  const displayImage = vendor?.profileImage || vendor?.image || "/eventra_photos/profile.png";

  return (
    <div className="theme-card border-b px-6 py-4 flex justify-between items-center">
      <input
        placeholder="Search bookings, clients, or services..."
        className="input w-96 px-4 py-2"
      />

      <div className="flex items-center gap-4">
        <Link href="/vendor/reminders" className="relative text-xl" aria-label="Vendor notifications">
          <span>🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 min-w-[1.25rem] rounded-full bg-red-500 px-1 text-center text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm font-semibold">{displayName}</p>

            <p className="text-xs theme-muted">
              {displayCategory}
            </p>
          </div>

          <img
            src={displayImage}
            alt="Vendor profile"
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
