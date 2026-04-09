"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getIdToken, onIdTokenChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import {
  clearStoredUserProfile,
  fetchBackendProfile,
  storeUserProfile,
  syncAuthToken,
} from "@/lib/auth";
import { disconnectSocket, syncSocketAuth } from "@/app/lib/socket";
import { useRef } from "react";

type UserRole = "customer" | "vendor" | "admin";

type AppUserProfile = {
  uid: string;
  name: string;
  phone: string;
  role: UserRole;
  businessName?: string;
};

type AuthContextType = {
  user: User | null;
  profile: AppUserProfile | null;
  loading: boolean;
  isReady: boolean;
  refreshProfile: () => Promise<AppUserProfile | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // 🔄 Fetch user from backend with retry
  const fetchUserProfile = async (uid: string, token?: string): Promise<AppUserProfile | null> => {
    try {
      console.log("Fetching profile for uid:", uid, "token len:", token?.length || 0);
      const data = await fetchBackendProfile(uid, token);
      console.log("Profile fetched:", !!data);
      return data;
    } catch (error: any) {
      const status = (error as any).status || 0;
      console.log("Profile fetch failed:", status, error);
      if (status === 401 && retryCount.current < maxRetries) {
        retryCount.current++;
        console.log(`🔄 Profile retry ${retryCount.current}/${maxRetries}`);

        await new Promise(r => setTimeout(r, 1000));

        const freshToken = await auth.currentUser!.getIdToken(true);
        return fetchUserProfile(uid, freshToken);
      }
      showToast("Couldn't load account. Please login again.", "error");
      return null;
    }
  };

  // 🔄 Refresh profile
  const refreshProfile = async () => {
    if (!auth.currentUser) return null;

    const uid = auth.currentUser.uid;
    const userProfile = await fetchUserProfile(uid);

    if (!userProfile) {
      console.warn("⚠️ Refresh skipped, profile not ready");
      return null;
    }

    setProfile(userProfile);
    storeUserProfile(userProfile);
    retryCount.current = 0;
    return userProfile;
  };

  // 🔥 Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          await syncAuthToken(null);
          disconnectSocket();
          setProfile(null);
          clearStoredUserProfile();
          setLoading(false);
          return;
        }

        setUser(firebaseUser);

        const token = await firebaseUser.getIdToken(true);
        console.log("🔑 Firebase token ready, len:", token.length);
        syncSocketAuth(token);

        const fetchedProfile = await fetchUserProfile(firebaseUser.uid, token);

        if (!fetchedProfile) {
          console.warn("⚠️ Profile not ready, fallback UI");

          setProfile(null);
          setIsReady(true);
          setLoading(false);

          return;
        }

        retryCount.current = 0;

        setProfile(fetchedProfile);
        storeUserProfile(fetchedProfile);
        setIsReady(true);
        setLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        setUser(null);
        setProfile(null);
        clearStoredUserProfile();
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [showToast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isReady,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔥 Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
