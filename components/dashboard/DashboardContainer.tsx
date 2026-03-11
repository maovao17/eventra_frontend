"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function DashboardContainer({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="theme-muted max-w-3xl">{subtitle}</p>
      </div>

      {children}
    </motion.section>
  );
}
