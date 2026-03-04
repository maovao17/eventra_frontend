"use client";

import { motion } from "framer-motion";
import { ShieldCheck, MessageCircle, Search } from "lucide-react";

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-10 py-24">
      <p className="text-center text-[#E87D5F] font-medium mb-3">
  Platform Features
</p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-center mb-16"
      >
        Everything You Need for Perfect Events
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-8">

        {/* Card 1 */}
        <motion.div
          whileHover={{ y: -8 }}
          className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#E87D5F]/10 mb-4">
            <Search className="text-[#E87D5F]" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Compare Vendors</h3>
          <p className="text-gray-600">
            Browse verified portfolios and compare quotes easily.
          </p>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          whileHover={{ y: -8 }}
          className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#E87D5F]/10 mb-4">
            <ShieldCheck className="text-[#E87D5F]" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
          <p className="text-gray-600">
            Protected escrow ensures safe transactions.
          </p>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          whileHover={{ y: -8 }}
          className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#E87D5F]/10 mb-4">
            <MessageCircle className="text-[#E87D5F]" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Centralized Communication
          </h3>
          <p className="text-gray-600">
            Chat and manage bookings in one dashboard.
          </p>
        </motion.div>

      </div>
    </section>
  );
}