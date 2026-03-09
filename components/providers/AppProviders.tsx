"use client";

import { AuthProvider } from "@/app/lib/auth";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
