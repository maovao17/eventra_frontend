"use client";

import { useState } from "react";

export default function SignupPage() {
  const [role, setRole] = useState<"individual" | "business">("individual");

  return (
    <div className="min-h-screen bg-[#F6EFEA] flex items-center justify-center relative overflow-hidden">

      {/* Background Blobs */}
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-[#E87D5F] rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-[#3C7D7B] rounded-full opacity-20 blur-3xl"></div>

      {/* Signup Card */}
      <div className="bg-white w-[420px] p-8 rounded-3xl shadow-xl relative z-10">

        <h1 className="text-center text-[#E87D5F] font-semibold text-lg">
          Eventra
        </h1>

        <h2 className="text-2xl font-bold text-center mt-2">
          Create Your Account
        </h2>

        <p className="text-center text-gray-500 text-sm mt-1">
          Join Eventra and start planning smarter.
        </p>

        {/* Role Switch */}
        <div className="flex bg-gray-100 rounded-full p-1 mt-6">
          <button
            onClick={() => setRole("individual")}
            className={`flex-1 py-2 rounded-full text-sm transition ${
              role === "individual"
                ? "bg-white shadow text-[#E87D5F]"
                : "text-gray-500"
            }`}
          >
            User
          </button>
          <button
            onClick={() => setRole("business")}
            className={`flex-1 py-2 rounded-full text-sm transition ${
              role === "business"
                ? "bg-white shadow text-[#E87D5F]"
                : "text-gray-500"
            }`}
          >
            Business
          </button>
        </div>

        {/* Form */}
        <form className="mt-6 space-y-4">

          {/* Full Name */}
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              type="text"
              placeholder="Your full name"
              className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E87D5F]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm text-gray-600">Phone Number</label>
            <input
              type="tel"
              placeholder="+91XXXXXXXXXX"
              className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E87D5F]"
            />
          </div>

          {/* Business Name (Only if Business selected) */}
          {role === "business" && (
            <div>
              <label className="text-sm text-gray-600">Business Name</label>
              <input
                type="text"
                placeholder="Your business name"
                className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E87D5F]"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#E87D5F] text-white py-3 rounded-xl mt-2 hover:opacity-90 transition"
          >
            Continue →
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-[#E87D5F] font-medium">
            Login
          </a>
        </p>

      </div>
    </div>
  );
}