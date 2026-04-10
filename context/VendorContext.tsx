"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getVendorMe, saveVendorProfile as apiSaveVendorProfile, updateVendorBookingStatus} from '@/app/lib/vendorApi';
import { getSocket, onSocketConnect, onSocketDisconnect } from '@/app/lib/socket';
import type { Booking, Notification } from '@/app/types/eventra';

type VendorBookingStatus = "pending" | "accepted" | "rejected" | "completed";
type BookingRealtimeUpdate = Partial<Booking> & { vendorUserId?: string };

type VendorContextType = {
  vendorProfile: any;
  loadingProfile: boolean;
  isMutating: boolean;
  dashboard?: any;
  loadingDashboard?: boolean;
  refreshVendorProfile: () => Promise<void>;
  saveVendorProfile: (data: any) => Promise<any>;
  updateBookingStatus: (bookingId: string, status: VendorBookingStatus) => Promise<boolean>;
};

const VendorContext = createContext<VendorContextType | null>(null);

export const VendorProvider = ({ children }: { children: ReactNode }) => {
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  
  const hasInitialized = useRef(false);
  const isUpdating = useRef(false);

  const refreshVendorProfile = useCallback(async () => {
    if (!profile?.uid || profile.role !== "vendor" || loadingProfile) {
      console.log("⏳ Skip fetch - loading or invalid");
      return;
    }

    console.log("🔄 REFRESH VENDOR PROFILE");
    setLoadingProfile(true);
    try {
      const res = await getVendorMe();
      console.log("PROFILE:", res);
      setVendorProfile(res || null);
    } catch (error) {
      console.error(" PROFILE ERROR:", error);
      setVendorProfile(null);
      showToast("Failed to load profile", "error");
    } finally {
      setLoadingProfile(false);
    }
  }, [profile?.uid, profile?.role, loadingProfile, showToast]);

  const saveVendorProfile = useCallback(async (data: any) => {
    if (!profile?.uid || isMutating) {
      console.log("⏳ Save skip - mutating");
      return null;
    }

    console.log("💾 SAVE:", data);
    setIsMutating(true);

    try {
      setVendorProfile((prev: any) => ({ 
        ...prev || {},
        ...data,
        profileCompleted: !!(data.packages?.length || data.category?.length || data.businessName)
      }));

      const response = await apiSaveVendorProfile(data);
      console.log("SAVE RESPONSE:", response);
      
      return response;
    } catch (error) {
      console.error(" SAVE ERROR:", error);
      await refreshVendorProfile();
      showToast("Save failed", "error");
      return null;
    } finally {
      setIsMutating(false);
    }
  }, [profile?.uid, isMutating, refreshVendorProfile, showToast]);

  const updateBookingStatus = useCallback(async (bookingId: string, status: VendorBookingStatus) => {
    if (!profile?.uid) return false;

    setIsMutating(true);
    try {
      const success = await updateVendorBookingStatus(bookingId, status);
      return success;
    } catch {
      showToast("Booking update failed", "error");
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [profile?.uid, showToast]);

  useEffect(() => {
    if (profile?.role === "vendor" && !hasInitialized.current) {
      console.log("INIT LOAD");
      hasInitialized.current = true;
      refreshVendorProfile();
    }
  }, [profile?.role, refreshVendorProfile]);

  console.log("Context render - profile:", !!vendorProfile, "loading:", loadingProfile, "mutating:", isMutating);

  return (
    <VendorContext.Provider value={{
      vendorProfile,
      loadingProfile,
      isMutating,
      dashboard: vendorProfile?.dashboard || null,
      loadingDashboard: loadingProfile,
      refreshVendorProfile,
      saveVendorProfile,
      updateBookingStatus,
    }}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendorData = () => {
  const context = useContext(VendorContext);
  if (!context) throw new Error("useVendorData must be within VendorProvider");
  return context;
};

