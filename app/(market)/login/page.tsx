"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth"
import OTPInput from "@/components/auth/OTPInput"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import {
  getAuthErrorMessage,
  normalizePhoneInput,
  sendOtp,
  signInWithGoogle,
  verifyOtp,
} from "@/lib/auth"
import { getDashboardPathForRole } from "@/lib/routes"
import { validateLogin } from "@/lib/validation/authValidation"


type Step = "phone" | "otp"

const STEP_COPY: Record<Step, { title: string; description: string; number: string }> = {
  phone: {
    number: "01",
    title: "Enter your phone number",
    description: "We’ll send a secure one-time code to your phone.",
  },
  otp: {
    number: "02",
    title: "Enter the 6-digit OTP",
    description: "Type the code manually to verify your phone before we sign you in.",
  },
}

export default function LoginPage() {
  const router = useRouter()
  const { refreshProfile } = useAuth()
  const { showToast } = useToast()
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)

  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [statusMessage, setStatusMessage] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    if (resendCountdown <= 0) return

    const timer = window.setTimeout(() => {
      setResendCountdown((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [resendCountdown])

  const handleSendOtp = async () => {
    const validationErrors = validateLogin({ phone })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setIsSendingOtp(true)
      setErrors({})
      setStatusMessage("Sending OTP...")

      const result = await sendOtp({
        phone,
        containerId: "recaptcha-container",
        recaptchaRef,
      })

      setConfirmationResult(result)
      setOtp("")
      setStep("otp")
      setResendCountdown(30)
      setStatusMessage("OTP sent. Enter the 6-digit code when you're ready.")
      showToast("OTP sent successfully.", "success")
    } catch (error) {
      const message = error instanceof Error ? error.message : getAuthErrorMessage(error)
      setErrors({ phone: message })
      setStatusMessage("")
      showToast(message, "error")
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: "Enter the full 6-digit OTP." })
      return
    }

    if (!confirmationResult) {
      setErrors({ otp: "Request OTP first." })
      return
    }

    try {
      setIsVerifyingOtp(true)
      setErrors({})
      setStatusMessage("Verifying OTP...")

      const credential = await verifyOtp(confirmationResult, otp)
      const token = await credential.user.getIdToken(true)
      localStorage.setItem("firebaseToken", token)

      setStatusMessage("Fetching your account...")
      const profile = await refreshProfile()

      if (!profile) {
        setErrors({
          otp: "This number is verified, but no Eventra account was found. Please complete signup.",
        })
        setStatusMessage("Verification complete. Account setup is still required.")
        return
      }

      showToast("Logged in successfully.", "success")
      router.replace(getDashboardPathForRole(profile.role))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not verify OTP."
      setErrors({ otp: message })
      setStatusMessage("")
      showToast(message, "error")
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      setErrors({})
      setStatusMessage("Signing in with Google...")

      await signInWithGoogle();
      showToast("Signed in with Google.", "success")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google login failed"
      setErrors({ phone: message })
      setStatusMessage("")
      showToast(message, "error")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const currentStep = STEP_COPY[step]

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6EFEA] px-4">
      <div className="relative z-10 w-full max-w-[430px] rounded-[32px] bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.jpeg"
            alt="Eventra"
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl object-cover"
          />
          <h1 className="mt-3 text-center text-lg font-semibold text-[#E87D5F]">
            Eventra
          </h1>
        </div>

        <div className="mt-6 rounded-3xl bg-[#FFF5F0] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E87D5F]">
            Step {currentStep.number}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#2F2520]">
            {currentStep.title}
          </h2>
          <p className="mt-2 text-sm text-[#7A6A63]">
            {currentStep.description}
          </p>
        </div>

        {step === "phone" ? (
          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSendingOtp || isVerifyingOtp || isGoogleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#E6D7D0] bg-white py-3 text-[#2F2520] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.9-5.5 3.9-3.3 0-6-2.8-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.3-.2-2H12Z" />
                <path fill="#34A853" d="M2 12c0 2.1.8 4 2.2 5.4l3.1-2.4c-.8-.6-1.3-1.8-1.3-3S6.5 9.6 7.3 9l-3.1-2.4A9.9 9.9 0 0 0 2 12Z" />
                <path fill="#FBBC05" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 .9-3.4.9-2.5 0-4.7-1.7-5.5-4l-3.2 2.5C5 19.8 8.2 22 12 22Z" />
                <path fill="#4285F4" d="M18.6 19.5c1.9-1.8 3-4.4 3-7.5 0-.7-.1-1.3-.2-2H12v3.9h5.5c-.3 1.5-1.2 2.8-2.1 3.5l3.2 2.1Z" />
              </svg>
              {isGoogleLoading ? "Signing in..." : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#B69B8E]">
              <span className="h-px flex-1 bg-[#EAD7CF]" />
              Or continue with OTP
              <span className="h-px flex-1 bg-[#EAD7CF]" />
            </div>

            <div>
              <label className="text-sm text-gray-600">Phone Number</label>
              <input
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(event) => setPhone(normalizePhoneInput(event.target.value))}
                disabled={isSendingOtp || isGoogleLoading}
                className="mt-1 w-full rounded-xl border px-4 py-3 disabled:bg-gray-100 disabled:text-gray-500"
              />
              {errors.phone ? <p className="mt-2 text-sm text-red-500">{errors.phone}</p> : null}
            </div>

            {statusMessage ? <p className="text-sm text-[#7A6A63]">{statusMessage}</p> : null}

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSendingOtp || isGoogleLoading}
              className="w-full rounded-xl bg-[#E87D5F] py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSendingOtp ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-[#F2E1D9] bg-[#FFF9F6] px-4 py-3 text-sm text-[#7A6A63]">
              OTP sent to <span className="font-semibold text-[#2F2520]">{phone}</span>
            </div>

            <OTPInput
              value={otp}
              onChange={(nextOtp) => {
                setOtp(nextOtp)
                if (errors.otp) {
                  setErrors((current) => ({ ...current, otp: "" }))
                }
              }}
              disabled={isVerifyingOtp}
              autoFocus
            />

            {errors.otp ? <p className="text-sm text-red-500">{errors.otp}</p> : null}
            {statusMessage ? <p className="text-sm text-[#7A6A63]">{statusMessage}</p> : null}

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp || otp.length !== 6}
              className="w-full rounded-xl bg-[#E87D5F] py-3 text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isVerifyingOtp ? "Verifying OTP..." : "Verify OTP"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setStep("phone")
                  setStatusMessage("")
                  setErrors({})
                }}
                disabled={isSendingOtp || isVerifyingOtp || isGoogleLoading}
                className="flex-1 rounded-xl border border-[#E6D7D0] py-3 text-sm font-medium text-[#6A554C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Change Number
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp || isVerifyingOtp || isGoogleLoading || resendCountdown > 0}
                className="flex-1 rounded-xl border border-[#E87D5F]/30 py-3 text-sm font-medium text-[#E87D5F] disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
              >
                {resendCountdown > 0
                  ? `Resend in ${resendCountdown}s`
                  : isSendingOtp
                    ? "Sending OTP..."
                    : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        <div id="recaptcha-container" />

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#E87D5F]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
