"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function TemplateCard({title,image,budget}:any) {
  return (
    <motion.div
      whileHover={{y:-8}}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <img src={image} className="h-52 w-full object-cover"/>

      <div className="p-5">
        <h3 className="text-xl font-semibold">{title}</h3>

        <p className="text-sm text-gray-500 mt-2">
          Est Budget {budget}
        </p>

        <Link
          href={`/events/create?type=${title}`}
          className="mt-4 inline-block bg-[#E87D5F] text-white px-5 py-2 rounded-full"
        >
          Select
        </Link>
      </div>
    </motion.div>
  );
}