"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

type Props = { id: string; name: string; rating: number; priceRange: string; description: string; image: string; index: number };

export default function VendorCard({ id, name, rating, priceRange, description, image, index }: Props) {
  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} whileHover={{ y: -4 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="relative h-44 w-full"><Image src={image} alt={name} fill className="object-cover" /></div>
      <div className="space-y-2 p-4">
        <h3 className="font-semibold">{name}</h3>
        <p className="text-xs text-slate-500">⭐ {rating} · {priceRange}</p>
        <p className="text-sm text-slate-600">{description}</p>
        <div className="flex gap-2 pt-1">
          <Link href={`/vendors/${id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">View Profile</Link>
          <Link href="/messages" className="rounded-lg bg-orange-500 px-3 py-2 text-xs text-white">Send Request</Link>
        </div>
      </div>
    </motion.article>
  );
}
