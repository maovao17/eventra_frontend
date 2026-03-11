"use client";

import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/im2.jpg')",
      }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative text-center">

        {/* Logo + Title */}
        <div className="mb-8">
          <img
            src="/logo.jpeg"
            alt="Eventra"
            className="mx-auto w-16 mb-3"
          />

          <h1 className="text-4xl font-bold text-orange-500">
            Eventra
          </h1>

          <h2 className="text-2xl font-semibold mt-2">
            Reset Password
          </h2>

          <p className="text-gray-600 mt-2 text-sm">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {/* Reset Card */}
        <div className="bg-white/80 backdrop-blur-md w-[380px] p-8 rounded-2xl shadow-lg text-left">

          <label className="block text-gray-700 mb-2">
            Email Address
          </label>

          <div className="flex items-center border rounded-lg px-3 py-3 mb-6 bg-white">
            <Mail size={18} className="text-gray-400 mr-2" />

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full outline-none"
            />
          </div>

          {/* Reset Button */}
          <button className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-xl font-semibold transition">
            Send Reset Link →
          </button>

          {/* Back to login */}
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-orange-500 mt-6 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

        </div>

      </div>
    </div>
  );
}
