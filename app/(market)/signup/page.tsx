"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { validateSignup } from "@/lib/validation/authValidation";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import {
  formatPhoneNumber,
  getAuthErrorMessage,
  normalizePhoneInput,
  sendOtp,
  verifyOtp,
} from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/app/lib/api";

export default function SignupPage() {

  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Removed redirect on page load to allow signup form to render

  const handleSendOtp = async (e: React.FormEvent) => {

    e.preventDefault();

    const formData: { name: string; phone: string; businessName?: string } = {
      name,
      phone,
    };

    if (role === "vendor") formData.businessName = businessName;

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

    setIsLoading(true);
    setApiError("");

    try {
      if (!confirmationResult) {
        setErrors({ otp: "Request OTP first." });
        return;
      }

      const credential = await verifyOtp(confirmationResult, otp);
      const formattedPhone = formatPhoneNumber(phone);

      // Create user in backend
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({
          name,
          phoneNumber: formattedPhone,
          userId: credential.user.uid,
          role,
          businessName: role === "vendor" ? businessName : undefined,
        })
      });

      // Create vendor profile if vendor role
      if (role === "vendor") {
        await apiFetch('/vendors', {
          method: 'POST',
          body: JSON.stringify({
            name: businessName || name,
            category: "Vendor Service",
            businessName: businessName || name,
            userId: credential.user.uid,
            price: 0,
            description: `${businessName || name} is now available on Eventra.`,
            responseTime: "1 hour",
          })
        });
      }

      // Refresh profile and redirect
      const nextProfile = await refreshProfile(credential.user.uid);
      console.log("SIGNUP NEXT PROFILE:", nextProfile);

      if (role === "vendor") {
        router.replace("/vendor/dashboard");
      } else {
        router.replace("/dashboard");
      }

    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setErrors({ otp: errorMessage });
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
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
                onClick={() => setRole("customer")}
                className={`flex-1 py-2 rounded-full text-sm transition ${
                  role === "customer"
                    ? "bg-white shadow text-[#E87D5F]"
                    : "text-gray-500"
                }`}
              >
                Customer
              </button>

              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`flex-1 py-2 rounded-full text-sm transition ${
                  role === "vendor"
                    ? "bg-white shadow text-[#E87D5F]"
                    : "text-gray-500"
                }`}
              >
                Vendor
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

            {role === "vendor" && (
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
              disabled={isLoading}
              className="w-full bg-[#E87D5F] text-white py-3 rounded-xl"
            >
              Send OTP →
            </button>

          </form>
        )}

        {apiError && (
          <div className="text-red-500 text-sm mt-4">
            {apiError}
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
              disabled={isLoading}
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
