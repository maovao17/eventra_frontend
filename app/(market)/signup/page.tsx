"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { validateSignup } from "@/lib/validation/authValidation";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import {
  formatPhoneNumber,
  getAuthErrorMessage,
  normalizePhoneInput,
  sendOtp,
  verifyOtp,
  type AppUserProfile,
} from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {

  const router = useRouter();
  const { isAuthenticated, isLoading, setProfile } = useAuth();

  const [role, setRole] = useState<"individual" | "business">("individual");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [, setPendingUser] = useState<AppUserProfile | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSendOtp = async (e: React.FormEvent) => {

    e.preventDefault();

    const formData: { name: string; phone: string; businessName?: string } = {
      name,
      phone,
    };

    if (role === "business") formData.businessName = businessName;

    const validationErrors = validateSignup(formData);

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
      const nextProfile: AppUserProfile = {
        uid: credential.user.uid,
        name,
        phone: formatPhoneNumber(phone),
        role,
        businessName: role === "business" ? businessName : undefined,
      };

      setPendingUser(nextProfile);
      setProfile(nextProfile);

      router.replace("/dashboard");

    } catch (error) {
      setErrors({ otp: getAuthErrorMessage(error) });
    }

  };

  return (
    <div className="min-h-screen bg-[#F6EFEA] flex items-center justify-center relative overflow-hidden">

      <div className="bg-white w-[420px] p-8 rounded-3xl shadow-xl relative z-10">

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
          {step === "form" ? "Create Your Account" : "Verify OTP"}
        </h2>

        {step === "form" && (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">

            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                type="button"
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
                type="button"
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

            <div>
              <label className="text-sm text-gray-600">Full Name</label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2 border rounded-xl"
              />

              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600">Phone Number</label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
                placeholder="+919876543210"
                className="w-full mt-1 px-4 py-2 border rounded-xl"
              />

              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone}</p>
              )}
            </div>

            {role === "business" && (
              <div>
                <label className="text-sm text-gray-600">
                  Business Name
                </label>

                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full mt-1 px-4 py-2 border rounded-xl"
                />

                {errors.businessName && (
                  <p className="text-red-500 text-sm">
                    {errors.businessName}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#E87D5F] text-white py-3 rounded-xl"
            >
              Send OTP →
            </button>

          </form>
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
          Already have an account?{" "}
          <Link href="/login" className="text-[#E87D5F] font-medium">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}
