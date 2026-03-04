"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="relative py-28 px-6">
      
      {/* Background Glow */}
      <div className="absolute inset-0 flex justify-center">
        <div className="w-[600px] h-[600px] bg-[#E87D5F]/20 blur-3xl rounded-full -z-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto bg-gradient-to-r from-[#3E7C78] to-[#4F8E89] text-white rounded-3xl px-12 py-20 text-center shadow-2xl"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Transform Your Event Planning?
        </h2>

        <p className="text-white/80 max-w-2xl mx-auto mb-10 text-lg">
          Join thousands of planners and vendors already using Eventra
          to simplify bookings, payments, and communication.
        </p>

        <div className="flex justify-center gap-6 flex-wrap">
          <Link
            href="/signup"
            className="bg-white text-[#3E7C78] px-8 py-4 rounded-full font-semibold hover:scale-105 transition"
          >
            Get Started Free
          </Link>

          <Link
            href="/signup"
            className="border border-white px-8 py-4 rounded-full hover:bg-white hover:text-[#3E7C78] transition"
          >
            Join as Vendor
          </Link>
        </div>

        {/* Trust Line */}
        <div className="mt-10 text-sm text-white/70">
          No credit card required • Secure escrow payments • Free for planners
        </div>
      </motion.div>
    </section>
  );
}