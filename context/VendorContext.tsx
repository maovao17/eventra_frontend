"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/app/lib/api";
import {
  getVendorMe,
  updateVendorMe,
  updateVendorBookingStatus,
  getVendorDashboard,
} from "@/app/lib/vendorApi";

type VendorBookingStatus = "pending" | "accepted" | "rejected" | "completed";

type VendorContextType = {
  vendorProfile: any;
  dashboard: any;
  loadingProfile: boolean;
  loadingDashboard: boolean;
  isMutating: boolean;
  refreshVendorProfile: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  saveVendorProfile: (data: any) => Promise<any>;
  updateBookingStatus: (bookingId: string, status: VendorBookingStatus) => Promise<boolean>;
};

const VendorContext = createContext<VendorContextType | null>(null);

export const VendorProvider = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth();

  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  // 🔄 Fetch Profile
  const refreshVendorProfile = useCallback(async () => {
    if (!profile?.uid || profile.role !== "vendor") {
      setVendorProfile(null);
      return;
    }

    setLoadingProfile(true);
    try {
      const res = await getVendorMe();
      setVendorProfile(res || null);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setVendorProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [profile?.uid, profile?.role]);

  // 🔄 Fetch Dashboard
  const refreshDashboard = useCallback(async () => {
    if (!profile?.uid || profile.role !== "vendor") {
      setDashboard(null);
      return;
    }

    setLoadingDashboard(true);
    try {
      const res = await getVendorDashboard();
      setDashboard(res || null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setDashboard(null);
    } finally {
      setLoadingDashboard(false);
    }
  }, [profile?.uid, profile?.role]);

  // 💾 Save Profile + Refresh
  const saveVendorProfile = useCallback(async (data: any) => {
    if (!profile?.uid) return null;

    setIsMutating(true);
    try {
      const response = await updateVendorMe(data);
      await refreshVendorProfile();
      await refreshDashboard();
      return response;
    } catch (err) {
      console.error("Profile update failed:", err);
      return null;
    } finally {
      setIsMutating(false);
    }
  }, [profile?.uid, refreshVendorProfile, refreshDashboard]);

  // 📅 Update Booking + Refresh
  const updateBookingStatus = useCallback(async (bookingId: string, status: VendorBookingStatus) => {
    if (!profile?.uid) return false;

    setIsMutating(true);
    try {
      const apiSuccess = await updateVendorBookingStatus(bookingId, status, profile.uid);
      if (status === "accepted" && apiSuccess) {
        const booking = await apiFetch(`/bookings/${bookingId}`);
        if (booking?.customerId) {
          const { getChatIdForBooking, initializeChatThread } = await import("@/lib/chat");
          const chatId = getChatIdForBooking(bookingId);
          await initializeChatThread({
            chatId,
            bookingId,
            participantIds: [profile.uid, booking.customerId],
          });
        }
      }
      await refreshDashboard();
      await refreshVendorProfile();
      return apiSuccess;
    } catch (err) {
      console.error("Booking update failed:", err);
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [profile?.uid, refreshDashboard, refreshVendorProfile]);

  // 🚀 Initial Load
  useEffect(() => {
    if (profile?.role === "vendor") {
      refreshVendorProfile();
      refreshDashboard();
    }
  }, [profile?.role, refreshVendorProfile, refreshDashboard]);

  return (
    <VendorContext.Provider
      value={{
        vendorProfile,
        dashboard,
        loadingProfile,
        loadingDashboard,
        isMutating,
        refreshVendorProfile,
        refreshDashboard,
        saveVendorProfile,
        updateBookingStatus,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};

export const useVendorData = () => {
  const context = useContext(VendorContext);
  if (!context) throw new Error("useVendorData must be used within VendorProvider");
  return context;
};
