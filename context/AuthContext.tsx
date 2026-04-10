"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { getDashboardPathForRole } from "@/lib/routes";
import { getIdToken, onIdTokenChanged, User } from "firebase/auth";
import { getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import {
  clearStoredUserProfile,
  fetchBackendProfile,
  storeUserProfile,
  syncAuthToken,
} from "@/lib/auth";
import { signOut } from "firebase/auth";

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
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const hasInitialized = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (result?.user) {
          console.log("Redirect login success:", result.user.uid);

          const token = await result.user.getIdToken();
          localStorage.setItem("firebaseToken", token);

          // Sync socket immediately
          // syncSocketAuth(token);
        }
      } catch (error) {
        console.error("Redirect login error:", error);
      }
    };

    handleRedirect();
  }, []);

  // Fetch profile with retry
  const fetchUserProfile = async (uid: string): Promise<AppUserProfile | null> => {
    try {
      console.log("Fetching profile for uid:", uid);
      const data = await fetchBackendProfile(uid);
      console.log("Profile fetched:", !!data);
      return data;
    } catch (error: any) {
      const status = (error as any).status || 0;
      console.log("Profile fetch failed:", status, error);
      if (status === 401 && retryCount.current < maxRetries) {
        retryCount.current++;
        console.log(`🔄 Profile retry ${retryCount.current}/${maxRetries}`);
        await new Promise(r => setTimeout(r, 1000));
        return fetchUserProfile(uid);
      }
      showToast("Couldn't load account. Please login again.", "error");
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!auth.currentUser) return null;
    retryCount.current = 0;
    const uid = auth.currentUser.uid;
    const userProfile = await fetchUserProfile(uid);
    if (userProfile) {
      setProfile(userProfile);
      storeUserProfile(userProfile);
    }
    return userProfile;
  };



  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (hasInitialized.current) return;

      try {
        hasInitialized.current = true;

        if (!firebaseUser) {
          setUser(null);
          await syncAuthToken(null);
          // disconnectSocket();
          setProfile(null);
          clearStoredUserProfile();
          setLoading(false);
          setIsReady(true);
          return;
        }

        setUser(firebaseUser);

        const token = await firebaseUser.getIdToken(true);
        localStorage.setItem('firebaseToken', token);
        console.log("🔑 Firebase token ready, len:", token.length);
        // syncSocketAuth(token);

        let fetchedProfile = await fetchUserProfile(firebaseUser.uid);

        if (!fetchedProfile) {
          console.log("No backend profile after auto-create");
          setProfile(null);
          setIsReady(true);
          setLoading(false);
          return;
        }
        setProfile(fetchedProfile);
        storeUserProfile(fetchedProfile);

        // 🚀 Auto-redirect after successful profile load
        const redirectPath = getDashboardPathForRole(fetchedProfile.role);
        const shouldRedirect =
          pathname === "/" ||
          pathname === "/login" ||
          pathname === "/signup";
        if (shouldRedirect && String(pathname) !== String(redirectPath)) {
          router.replace(redirectPath);
        }

        setLoading(false);
        setIsReady(true);
      } catch (error) {
        console.error("Auth error:", error);
        setUser(null);
        setProfile(null);
        clearStoredUserProfile();
        setLoading(false);
        setIsReady(true);
      }
    });

    return () => unsubscribe();
  }, [pathname, router, showToast]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("firebaseToken");
      clearStoredUserProfile();
      setUser(null);
      setProfile(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isReady,
        refreshProfile,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
