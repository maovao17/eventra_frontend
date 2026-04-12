"use client";

import { ArrowLeft, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();

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
            Account Access
          </h2>

          <p className="text-gray-600 mt-2 text-sm">
            No password needed — we use secure phone verification
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-md w-[380px] p-8 rounded-2xl shadow-lg text-left space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-4">
            <Smartphone size={24} className="text-orange-500 shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">Phone-based login</p>
              <p className="text-gray-600 text-xs mt-0.5">
                Eventra uses one-time codes sent to your phone number. There is no password to reset.
              </p>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            To regain access to your account, simply log in using your registered phone number and verify with the OTP we send you.
          </p>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 rounded-xl font-semibold transition"
          >
            Login with Phone →
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-orange-500 mt-2 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
