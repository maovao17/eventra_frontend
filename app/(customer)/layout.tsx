"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomerTopbar from "@/components/customer/CustomerTopbar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, []);

  return (
    <>
      <CustomerTopbar />
      <div className="max-w-7xl mx-auto px-8 py-10">
        {children}
      </div>
    </>
  );
}