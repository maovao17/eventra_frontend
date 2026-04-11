"use client"

import {
  ConfirmationResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  User,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPhoneNumber,
  onIdTokenChanged,
  type Auth,
  signInWithRedirect
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { ApiFetchError, apiFetch } from "@/app/lib/api"

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
  role: UserRole | "admin"
  businessName?: string
}

type BackendUserPayload = {
  name: string
  authProvider: "phone" | "google"
  role?: UserRole
  phoneNumber?: string
  email?: string
  businessName?: string
}

type GoogleSignupOptions = {
  role?: UserRole
  name?: string
  businessName?: string
}

const googleProvider = new GoogleAuthProvider()

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

const mapBackendProfile = (data: any, uid: string): AppUserProfile => ({
  uid: String(data.userId || uid),
  name: String(data.name || "Eventra User"),
  phone: String(data.phoneNumber || ""),
  role: (data.role || "customer") as AppUserProfile["role"],
  businessName: data.businessName ? String(data.businessName) : undefined,
})

const getRequiredIdToken = async (user: User) => {
  const token = await user.getIdToken(true)

  if (!token) {
    throw new Error("Could not verify your Google sign-in. Please try again.")
  }

  return token
}

const withAuthorizationHeader = (
  token: string,
  headers?: HeadersInit
): Record<string, string> => ({
  ...((headers as Record<string, string> | undefined) ?? {}),
  Authorization: `Bearer ${token}`,
})

export const fetchBackendProfile = async (uid: string) => {
  try {
    console.log("🔍 Backend profile fetch");
    const data = await apiFetch("/users/me")
    console.log("✅ Backend profile:", !!data);
    return data ? mapBackendProfile(data, uid) : null
  } catch (error: any) {
    console.log("❌ Backend profile error:", error.status || 'unknown');
    if (error instanceof ApiFetchError && error.status === 404) {
      return null
    }
    if (error.status === 401) {
      return null;
    }

    throw error
  }
}

export const ensureBackendProfile = async (
  user: User,
  payload?: BackendUserPayload
) => {
  const token = await getRequiredIdToken(user)
  let profile: AppUserProfile | null

  try {
    profile = await fetchBackendProfile(user.uid)
  } catch (error) {
    if (error instanceof ApiFetchError && error.status === 401) {
      return null
    }
    throw error
  }

  if (profile) return profile

  if (!payload) {
    throw new Error("Could not load your Eventra account.")
  }

  await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
      userId: user.uid,
      authProvider: payload.authProvider,
      role: payload.role,
      businessName: payload.businessName,
    }),
  })

  profile = await fetchBackendProfile(user.uid)
  if (!profile) {
    throw new Error("Could not load your Eventra account.")
  }

  return profile
}



export const signInWithGoogle = async (options?: { role?: string }) => {
  const role = options?.role ?? "customer";
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account",
  });

  // store role temporarily if needed
  sessionStorage.setItem("loginRole", role);

  await signInWithRedirect(auth, provider);

  return null; // IMPORTANT: do not return user
};

export const subscribeToAuthState = (
  callback: (user: User | null) => void
) => onIdTokenChanged(auth, callback)

export const syncAuthToken = async (tokenOrUser: string | User | null) => {
  if (typeof tokenOrUser === 'string') {
    return tokenOrUser;
  }
  if (!tokenOrUser) {
    return null
  }

  const token = await tokenOrUser.getIdToken(true)
  return token
}

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
