"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { apiFetch } from "@/app/lib/api";
import {
  getVendorMe,
  updateVendorMe,
  updateVendorBookingStatus,
  getVendorDashboard,
} from "@/app/lib/vendorApi";
import { getSocket, onSocketConnect, onSocketDisconnect } from "@/app/lib/socket";
import type { Booking, Notification } from "@/app/types/eventra";

type VendorBookingStatus = "pending" | "accepted" | "rejected" | "completed";
type BookingRealtimeUpdate = Partial<Booking> & { vendorUserId?: string };

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
  const { showToast } = useToast();

  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

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
    } catch {
      setVendorProfile(null);
      showToast("We couldn't load your business profile.", "error");
    } finally {
      setLoadingProfile(false);
    }
  }, [profile?.uid, profile?.role, showToast]);

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
    } catch {
      setDashboard(null);
      showToast("We couldn't load your dashboard stats.", "error");
    } finally {
      setLoadingDashboard(false);
    }
  }, [profile?.uid, profile?.role, showToast]);

  // 💾 Save Profile + Refresh
  const saveVendorProfile = useCallback(async (data: any) => {
    if (!profile?.uid) return null;

    console.log("💾 VendorContext saving:", data);

    setIsMutating(true);
    try {
      // Optimistic update
      setVendorProfile(prev => ({ ...prev, ...data }));

      const response = await updateVendorMe(data);
      console.log("💾 VendorContext response:", response);

      // Confirm with refresh
      await refreshVendorProfile();

      return response;
    } catch (error) {
      // Revert optimistic on error
      await refreshVendorProfile();
      showToast("We couldn't save your profile changes.", "error");
      return null;
    } finally {
      setIsMutating(false);
    }
  }, [profile?.uid, refreshVendorProfile, showToast]);

  // 📅 Update Booking + Refresh
  const updateBookingStatus = useCallback(async (bookingId: string, status: VendorBookingStatus) => {
    if (!profile?.uid) return false;

    setIsMutating(true);
    try {
      const apiSuccess = await updateVendorBookingStatus(bookingId, status);
      if (status === "accepted" && apiSuccess) {
        const booking = await apiFetch(`/bookings/${bookingId}`);
        if ((booking as any)?.customerId) {
          const { initializeChatThread } = await import("@/lib/chat");
          await initializeChatThread({
            bookingId,
          });
        }
      }
      await refreshDashboard();
      await refreshVendorProfile();
      return apiSuccess;
    } catch {
      showToast("We couldn't update that booking status.", "error");
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [profile?.uid, refreshDashboard, refreshVendorProfile, showToast]);

  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const refreshRef = useRef({ refreshDashboard, refreshVendorProfile });
  useEffect(() => {
    refreshRef.current = { refreshDashboard, refreshVendorProfile };
  }, [refreshDashboard, refreshVendorProfile]);

  // 🚀 Initial Load
  useEffect(() => {
    if (profile?.role === "vendor") {
      refreshVendorProfile();
      refreshDashboard();
    }
  }, [profile?.role, refreshVendorProfile, refreshDashboard]);

  useEffect(() => {
    if (profile?.role !== "vendor") {
      setIsSocketConnected(false);
      return;
    }

    const socket = getSocket();
    setIsSocketConnected(socket.connected);

    const refreshVendorData = async () => {
      await Promise.all([
        refreshRef.current.refreshDashboard(),
        refreshRef.current.refreshVendorProfile(),
      ]);
    };

    const handleConnect = () => {
      setIsSocketConnected(true);
      void refreshVendorData();
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
    };

    const handleBookingUpdate = (bookingUpdate: BookingRealtimeUpdate) => {
      const currentProfile = profileRef.current;
      if (
        currentProfile?.role !== "vendor" ||
        bookingUpdate.vendorUserId !== currentProfile.uid
      ) {
        return;
      }

      void refreshVendorData();
    };

    const handleNotification = (notification: Notification) => {
      if (!notification) return;
      if (profileRef.current?.role !== "vendor") return;
      void refreshVendorData();
    };

    const removeConnectListener = onSocketConnect(handleConnect);
    const removeDisconnectListener = onSocketDisconnect(handleDisconnect);

    socket.on("bookingStatusUpdated", handleBookingUpdate);
    socket.on("notificationCreated", handleNotification);

    return () => {
      removeConnectListener();
      removeDisconnectListener();
      socket.off("bookingStatusUpdated", handleBookingUpdate);
      socket.off("notificationCreated", handleNotification);
    };
  }, [profile?.role]);

  useEffect(() => {
    if (profile?.role !== "vendor" || isSocketConnected) return;

    const interval = setInterval(() => {
      void Promise.all([
        refreshDashboard(),
        refreshVendorProfile(),
      ]);
    }, 15000);

    return () => clearInterval(interval);
  }, [isSocketConnected, profile?.role, refreshDashboard, refreshVendorProfile]);

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
