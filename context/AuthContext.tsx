"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import {
  clearStoredUserProfile,
  fetchBackendProfile,
  storeUserProfile,
  syncAuthToken,
} from "@/lib/auth";

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
  refreshProfile: () => Promise<AppUserProfile | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch user from backend
  const fetchUserProfile = async (uid: string) => {
    try {
      return await fetchBackendProfile(uid);
    } catch (err) {
      console.error("Fetch user failed:", err);
      showToast("We couldn't load your account details. Please retry.", "error");
      return null;
    }
  };

  // 🔄 Refresh profile
  const refreshProfile = async () => {
    if (!auth.currentUser) return null;

    await syncAuthToken(auth.currentUser);

    const uid = auth.currentUser.uid;
    const userProfile = await fetchUserProfile(uid);

    if (userProfile) {
      setProfile(userProfile);
      storeUserProfile(userProfile);
    } else {
      setProfile(null);
      clearStoredUserProfile();
    }

    return userProfile;
  };

  // 🔥 Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        await syncAuthToken(firebaseUser);
        const userProfile = await fetchUserProfile(firebaseUser.uid);
        setProfile(userProfile);
        if (userProfile) {
          storeUserProfile(userProfile);
        } else {
          clearStoredUserProfile();
        }
      } else {
        await syncAuthToken(null);
        setProfile(null);
        clearStoredUserProfile();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [showToast]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
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
