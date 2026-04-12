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
    <div className="theme-card border-b px-6 py-4 flex justify-end items-center">
      <Link href="/vendor/reminders" className="relative text-xl" aria-label="Vendor notifications">
        <span>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 min-w-[1.25rem] rounded-full bg-red-500 px-1 text-center text-xs font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
}
