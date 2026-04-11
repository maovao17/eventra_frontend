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
import {
  onIdTokenChanged,
  User,
  signOut,
} from "firebase/auth";
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

  const retryCount = useRef(0);
  const maxRetries = 3;

  // prevent stale loading
  const loadingRef = useRef(true);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // handle redirect login
useEffect(() => {
    const timeout = setTimeout(() => {
      if (loadingRef.current) {
        setLoading(false);
        setIsReady(true);
      }
    }, 7000);

    return () => clearTimeout(timeout);
  }, []);

  const fetchUserProfile = async (
    uid: string
  ): Promise<AppUserProfile | null> => {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000)
      );

      const data = await Promise.race([
        fetchBackendProfile(uid),
        timeout,
      ]);

      retryCount.current = 0;
      const profileData = (data as any)?.data || data;
      return profileData as AppUserProfile;
    } catch (error: any) {
      const status = error?.status || 0;

      if (status === 401 && retryCount.current < maxRetries) {
        retryCount.current++;
        await new Promise((r) => setTimeout(r, 1000));
        return fetchUserProfile(uid);
      }

      showToast("Couldn't load account. Please login again.", "error");
      return null;
    }
  };

  const refreshProfile = async () => {
    if (!auth.currentUser) return null;

    retryCount.current = 0;
    const currentUser = auth.currentUser!;
    const profile = await fetchUserProfile(currentUser.uid);

    if (profile) {
      setProfile(profile);
      storeUserProfile(profile);
    }

    return profile;
  };

  // main auth listener
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          await syncAuthToken(null);
          setProfile(null);
          clearStoredUserProfile();
          setLoading(false);
          setIsReady(true);
          return;
        }

        setUser(firebaseUser);

        const token = await firebaseUser.getIdToken(true);
        localStorage.setItem("firebaseToken", token);
        await syncAuthToken(token);

        const fetchedProfile = await fetchUserProfile(firebaseUser.uid as string);

        if (!fetchedProfile) {
          // Keep the Firebase session alive — signup page needs it to create the backend user.
          // Only redirect away from protected pages; login/signup pages handle this themselves.
          setProfile(null);
          clearStoredUserProfile();
          setLoading(false);
          setIsReady(true);

          const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/signup";
          if (!isPublicPage) {
            router.push("/login");
          }
          return;
        }

        setProfile(fetchedProfile);
        storeUserProfile(fetchedProfile);

        const redirectPath = getDashboardPathForRole(fetchedProfile.role);
        const isLoginPage = pathname === "/" || pathname === "/login" || pathname === "/signup";

        if (isLoginPage) {
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
  }, []);

  const logout = async () => {
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
        logout,
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