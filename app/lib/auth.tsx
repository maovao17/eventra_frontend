"use client";
import { createContext, useContext, useMemo, useState } from "react";

export type UserRole = "customer" | "business";

type SessionUser = { name: string; email: string; role: UserRole };

type AuthContextType = {
  user: SessionUser | null;
  login: (user: SessionUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("eventra-session");
    return saved ? JSON.parse(saved) : null;
  });

  const value = useMemo(
    () => ({
      user,
      login: (nextUser: SessionUser) => {
        setUser(nextUser);
        localStorage.setItem("eventra-session", JSON.stringify(nextUser));
      },
      logout: () => {
        setUser(null);
        localStorage.removeItem("eventra-session");
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
