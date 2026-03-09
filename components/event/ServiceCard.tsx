"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ServiceCard({ service, removeService }: { service: string; removeService: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="glass-card flex items-center justify-between p-4">
      <div>
        <h3 className="font-semibold">{service}</h3>
        <p className="text-sm text-slate-500">Find and compare trusted vendors for this service.</p>
      </div>
      <div className="flex gap-2">
        <Link href={`/vendors?service=${service.toLowerCase()}`} className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white">Find Vendors</Link>
        <button onClick={removeService} className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">Remove</button>
      </div>
    </motion.div>
  );
}
