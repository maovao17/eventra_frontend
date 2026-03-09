"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TemplateCard from "@/components/customer/TemplateCard";
import { templates } from "@/app/lib/mock-data";

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-orange-500">Template gallery</p>
          <h1 className="mt-2 text-4xl font-bold">Choose an event starter</h1>
        </div>
        <Link href="/events/create" className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm text-white">Create Custom Event</Link>
      </motion.div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template, index) => <TemplateCard key={template.title} {...template} index={index} />)}
      </div>
    </div>
  );
}
