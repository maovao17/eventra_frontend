"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function DashboardGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      className={`grid gap-6 md:grid-cols-3 ${className}`.trim()}
    >
      {children}
    </motion.div>
  );
}
