"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/app/lib/auth";

export default function SignupPage() {
  const [role, setRole] = useState<UserRole>("customer");
  const { login } = useAuth();
  const router = useRouter();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login({ name: role === "customer" ? "New Planner" : "New Vendor", email: "new@eventra.com", role });
    router.push(role === "customer" ? "/templates" : "/vendor/dashboard");
  };

  return <form onSubmit={onSubmit} className="mx-auto mt-16 max-w-lg glass-card p-8 space-y-4"><h1 className="text-2xl font-bold">Create Account</h1><input className="input" placeholder="Full name" /><input className="input" placeholder="Email" /><input className="input" placeholder="Password" type="password" /><div className="flex gap-2">{(["customer", "business"] as UserRole[]).map((r)=><button type="button" key={r} onClick={()=>setRole(r)} className={`rounded-xl px-4 py-2 text-sm ${role===r?"bg-orange-500 text-white":"bg-slate-100"}`}>{r}</button>)}</div><button className="w-full rounded-xl bg-slate-900 py-3 text-white">Sign up</button></form>;
}
