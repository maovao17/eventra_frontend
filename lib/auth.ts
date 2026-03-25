"use client"

import {
  ConfirmationResult,
  RecaptchaVerifier,
  User,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPhoneNumber,
  type Auth,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier
  }
}

export type UserRole = "customer" | "vendor"

export type AppUserProfile = {
  uid: string
  name: string
  phone: string
  role: UserRole
  businessName?: string
}

const PROFILE_STORAGE_KEY = "eventra_user"

const getDigits = (value: string) => value.replace(/\D/g, "")

export const normalizePhoneInput = (value: string) => {
  const digits = getDigits(value)

  if (!digits) return ""

  if (digits.startsWith("91")) {
    return `+${digits.slice(0, 12)}`
  }

  return `+91${digits.slice(0, 10)}`
}

export const formatPhoneNumber = (value: string) => {
  const digits = getDigits(value)

  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`
  if (value.startsWith("+91") && digits.length >= 10) return `+91${digits.slice(-10)}`

  return value.trim()
}

export const isValidIndianPhoneNumber = (value: string) =>
  /^\+91\d{10}$/.test(formatPhoneNumber(value))

export const getAuthErrorMessage = (error: unknown) => {
  const code = typeof error === "object" && error && "code" in error
    ? String(error.code)
    : ""

  switch (code) {
    case "auth/invalid-phone-number":
      return "Enter a valid phone number with +91."
    case "auth/billing-not-enabled":
      return "Phone authentication billing is not enabled for this Firebase project."
    case "auth/invalid-verification-code":
      return "The OTP you entered is incorrect."
    case "auth/code-expired":
      return "This OTP has expired. Please request a new one."
    case "auth/captcha-check-failed":
    case "auth/missing-recaptcha-token":
      return "Recaptcha verification failed. Please try again."
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again."
    default:
      return error instanceof Error && error.message
        ? error.message
        : "Something went wrong. Please try again."
  }
}

export const enableAuthPersistence = async (targetAuth: Auth = auth) => {
  await setPersistence(targetAuth, browserLocalPersistence)
}

export const getOrCreateRecaptcha = (
  containerId: string,
  recaptchaRef: { current: RecaptchaVerifier | null }
) => {
  if (recaptchaRef.current) return recaptchaRef.current

  if (typeof window !== "undefined" && !window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
    })
    recaptchaRef.current = window.recaptchaVerifier
  }

  if (!recaptchaRef.current) {
    throw new Error("Recaptcha could not be initialized.")
  }

  return recaptchaRef.current
}

export const sendOtp = async ({
  phone,
  containerId,
  recaptchaRef,
}: {
  phone: string
  containerId: string
  recaptchaRef: { current: RecaptchaVerifier | null }
}) => {
  const formattedPhone = formatPhoneNumber(phone)

  if (!isValidIndianPhoneNumber(formattedPhone)) {
    throw new Error("Enter a valid phone number with +91.")
  }

  await enableAuthPersistence()

  // For test numbers, skip recaptcha
  const isTestNumber = formattedPhone.includes("1234567890") || formattedPhone.includes("0987654321")

  if (isTestNumber) {
    return signInWithPhoneNumber(auth, formattedPhone, undefined)
  }

  const verifier = getOrCreateRecaptcha(containerId, recaptchaRef)

  return signInWithPhoneNumber(auth, formattedPhone, verifier)
}

export const verifyOtp = async (
  confirmationResult: ConfirmationResult,
  otp: string
) => {
  try {
    return await confirmationResult.confirm(otp.trim());
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";
    const message = typeof error === "object" && error && "message" in error
      ? String(error.message)
      : "";
    throw new Error(code || message || "OTP verification failed");
  }
}

export const sendPhoneOtp = sendOtp
export const verifyPhoneOtp = verifyOtp

export const subscribeToAuthState = (
  callback: (user: User | null) => void
) => onAuthStateChanged(auth, callback)

export const storeUserProfile = (profile: AppUserProfile) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
}

export const getStoredUserProfile = () => {
  if (typeof window === "undefined") return null

  const rawProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY)
  if (!rawProfile) return null

  try {
    return JSON.parse(rawProfile) as AppUserProfile
  } catch {
    return null
  }
}

export const clearStoredUserProfile = () => {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(PROFILE_STORAGE_KEY)
}
