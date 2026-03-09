"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Props = { title: string; image: string; budget: string; description: string; index: number };

export default function TemplateCard({ title, image, budget, description, index }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      <div className="h-48 overflow-hidden">
        <motion.img whileHover={{ scale: 1.07 }} transition={{ duration: 0.4 }} src={image} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-3 p-5">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
        <p className="text-sm font-medium text-orange-600">Estimated budget: {budget}</p>
        <Link href={`/events/create?type=${title}`} className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm text-white">Select Template</Link>
      </div>
    </motion.article>
  );
}
