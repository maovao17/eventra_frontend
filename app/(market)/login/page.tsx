"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { validateLogin } from "@/lib/validation/authValidation";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import {
  getAuthErrorMessage,
  normalizePhoneInput,
  sendOtp,
  verifyOtp,
} from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {

  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  // Removed redirect on page load to allow login form to render

  const handleSendOtp = async () => {

    const validationErrors = validateLogin({ phone });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {

      setErrors({});
      const result = await sendOtp({
        phone,
        containerId: "recaptcha-container",
        recaptchaRef,
      });

      setConfirmationResult(result);

      setStep("otp");

    } catch (error) {
      setErrors({ phone: error instanceof Error ? error.message : getAuthErrorMessage(error) });
    }

  };

  const handleVerifyOtp = async () => {

    if (!otp) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    try {

      if (!confirmationResult) {
        setErrors({ otp: "Request OTP first." });
        return;
      }

      const credential = await verifyOtp(confirmationResult, otp);
      const nextProfile = await refreshProfile(credential.user.uid)
      console.log("LOGIN NEXT PROFILE:", nextProfile)

      if (nextProfile?.role === "vendor") {
        router.replace("/vendor/dashboard")
      } else {
        router.replace("/dashboard")
      }

    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setErrors({
        otp: errorMessage,
      });
    }

  };

  return (
    <div className="min-h-screen bg-[#F6EFEA] flex items-center justify-center relative overflow-hidden">

      <div className="bg-white w-[400px] p-8 rounded-3xl shadow-xl relative z-10">

        <div className="flex flex-col items-center">
          <Image
            src="/logo.jpeg"
            alt="Eventra"
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl object-cover"
          />
          <h1 className="mt-3 text-center text-[#E87D5F] font-semibold text-lg">
            Eventra
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-center mt-2">
          {step === "phone" ? "Login with Phone" : "Verify OTP"}
        </h2>

        {step === "phone" && (
          <div className="mt-6 space-y-4">

            <input
              type="tel"
              placeholder="+919876543210"
              value={phone}
              onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
              className="w-full mt-1 px-4 py-2 border rounded-xl"
            />

            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}

            <button
              onClick={handleSendOtp}
              className="w-full bg-[#E87D5F] text-white py-3 rounded-xl"
            >
              Send OTP →
            </button>

          </div>
        )}

        {step === "otp" && (
          <div className="mt-6 space-y-4">

            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl text-center"
            />

            {errors.otp && (
              <p className="text-red-500 text-sm">{errors.otp}</p>
            )}

            <button
              onClick={handleVerifyOtp}
              className="w-full bg-[#E87D5F] text-white py-3 rounded-xl"
            >
              Verify OTP →
            </button>

          </div>
        )}

        <div id="recaptcha-container"></div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#E87D5F]">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}
