"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type TemplateCardProps = {
  title: string;
  image: string;
  budget: string;
};

export default function TemplateCard({title,image,budget}: TemplateCardProps) {
  return (
    <motion.div
      whileHover={{y:-8}}
      className="theme-card overflow-hidden"
    >
      <img src={image} className="h-52 w-full object-cover"/>

      <div className="p-5">
        <h3 className="text-xl font-semibold">{title}</h3>

        <p className="theme-muted mt-2 text-sm">
          Est Budget {budget}
        </p>

        <Link
          href={`/events/create?type=${title}`}
          className="theme-button mt-4 inline-block px-5 py-2"
        >
          Select
        </Link>
      </div>
    </motion.div>
  );
}
