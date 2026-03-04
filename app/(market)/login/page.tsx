"use client";

import { useState } from "react";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOtp = () => {
    if (!phone) return alert("Enter phone number");
    // TODO: call backend API here
    console.log("Sending OTP to:", phone);
    setStep("otp");
  };

  const handleVerifyOtp = () => {
    if (!otp) return alert("Enter OTP");
    // TODO: call verify API
    console.log("Verifying OTP:", otp);
  };

  return (
    <div className="min-h-screen bg-[#F6EFEA] flex items-center justify-center relative overflow-hidden">

      {/* Background Blobs */}
      <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-[#E87D5F] rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-[#3C7D7B] rounded-full opacity-20 blur-3xl"></div>

      {/* Card */}
      <div className="bg-white w-[400px] p-8 rounded-3xl shadow-xl relative z-10">

        <h1 className="text-center text-[#E87D5F] font-semibold text-lg">
          Eventra
        </h1>

        <h2 className="text-2xl font-bold text-center mt-2">
          {step === "phone" ? "Login with Phone" : "Verify OTP"}
        </h2>

        <p className="text-center text-gray-500 text-sm mt-1">
          {step === "phone"
            ? "Enter your phone number to receive OTP."
            : `OTP sent to ${phone}`}
        </p>

        {step === "phone" && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-gray-600">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E87D5F]"
              />
            </div>

            <button
              onClick={handleSendOtp}
              className="w-full bg-[#E87D5F] text-white py-3 rounded-xl mt-2 hover:opacity-90 transition"
            >
              Send OTP →
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-gray-600">Enter OTP</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-[#E87D5F]"
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              className="w-full bg-[#E87D5F] text-white py-3 rounded-xl mt-2 hover:opacity-90 transition"
            >
              Verify OTP →
            </button>

            <button
              onClick={() => setStep("phone")}
              className="w-full text-sm text-gray-500"
            >
              Change phone number
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-[#E87D5F]">
            Sign up
          </a>
        </p>

      </div>
    </div>
  );
}