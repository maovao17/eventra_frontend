"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F6EFEA]">

  {/* Background Blobs */}
  <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#E87D5F]/20 rounded-full blur-3xl"></div>
  <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#3C7D7B]/20 rounded-full blur-3xl"></div>

  {/* Content Container */}
  <div className="max-w-7xl mx-auto px-10 py-28 grid md:grid-cols-2 gap-16 items-center relative z-10">

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-5xl font-bold leading-tight">
        Plan Your Event.
        <br />
        Book Trusted Vendors.
        <br />
        <span className="text-[#E87D5F]">All in One Place.</span>
      </h1>

      <motion.p
        className="mt-6 text-gray-600 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Eventra connects planners with verified vendors,
        simplifying everything from weddings to corporate events.
      </motion.p>

      <motion.div
        className="mt-8 flex gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Link
          href="/signup"
          className="bg-[#E87D5F] text-white px-6 py-3 rounded-full hover:scale-105 transition"
        >
          Get Started
        </Link>

        <Link
          href="/signup"
          className="border border-gray-400 px-6 py-3 rounded-full hover:bg-gray-100 transition"
        >
          Join as Business
        </Link>
      </motion.div>
    </motion.div>

    <motion.div
      className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <img
        src="/HeroCard.avif"
        alt="Event preview"
        className="w-full h-full object-cover"
      />
    </motion.div>

  </div>
</section>
  );
}