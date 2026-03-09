"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/app/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>("customer");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login({ name: role === "customer" ? "Sarah" : "Royal Events", email: "demo@eventra.com", role });
    router.push(role === "customer" ? "/events" : "/vendor/dashboard");
  };

  return <form onSubmit={onSubmit} className="mx-auto mt-20 max-w-md glass-card p-8 space-y-4"><h1 className="text-2xl font-bold">Login</h1><input className="input" placeholder="Email" /><input className="input" placeholder="Password" type="password" /><div className="flex gap-2">{(["customer", "business"] as UserRole[]).map((r)=><button type="button" key={r} onClick={()=>setRole(r)} className={`rounded-xl px-4 py-2 text-sm ${role===r?"bg-orange-500 text-white":"bg-slate-100"}`}>{r}</button>)}</div><button className="w-full rounded-xl bg-orange-500 py-3 text-white">Continue</button></form>;
}
