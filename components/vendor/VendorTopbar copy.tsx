"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/app/lib/api";

type VendorTopbarProfile = {
  businessName?: string;
  name?: string;
  category?: string;
  profileImage?: string;
  image?: string;
};

export default function VendorTopbar() {
  const { profile } = useAuth();
  const [vendor, setVendor] = useState<VendorTopbarProfile | null>(null);

  useEffect(() => {
    const loadVendor = async () => {
      if (!profile?.uid) return;
      const response = await apiFetch(`/vendors?userId=${profile.uid}`);
      if (!(response as any)?.error) {
        setVendor(response as VendorTopbarProfile);
      }
    };

    void loadVendor();
  }, [profile?.uid]);

  const displayName = vendor?.businessName || vendor?.name || profile?.name || "Vendor";
  const displayCategory = vendor?.category || "Vendor Service";
  const displayImage = vendor?.profileImage || vendor?.image || "/eventra_photos/photographer.jpg";

  return (
    <div className="theme-card border-b px-6 py-4 flex justify-between items-center">
      <input
        placeholder="Search bookings, clients, or services..."
        className="input w-96 px-4 py-2"
      />

      <div className="flex items-center gap-4">
        🔔

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
