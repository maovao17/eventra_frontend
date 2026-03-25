import { initializeApp } from "firebase/app";
import type { MutableRefObject } from "react";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCn5dbwF23QGe4zUDPfbjlf9XfP4k7kmik",
  authDomain: "eventra-3b4de.firebaseapp.com",
  projectId: "eventra-3b4de",
  storageBucket: "eventra-3b4de.firebasestorage.app",
  messagingSenderId: "589596282613",
  appId: "1:589596282613:web:587cfb0856cf7132f87fbc",
  measurementId: "G-MKF0EK3C7Z",
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 🔹 SEND OTP
export const sendOtp = async ({
  phone,
  containerId,
  recaptchaRef,
}: {
  phone: string;
  containerId: string;
  recaptchaRef: MutableRefObject<RecaptchaVerifier | null>;
}) => {
  // Clear old recaptcha if exists
  if (recaptchaRef.current) {
    recaptchaRef.current.clear();
  }

  // Create new recaptcha
  recaptchaRef.current = new RecaptchaVerifier(
    auth,
    containerId,
    {
      size: "invisible",
    }
  );

  // Send OTP
  return signInWithPhoneNumber(auth, phone, recaptchaRef.current);
};

// 🔹 VERIFY OTP
export const verifyOtp = async (
  confirmationResult: ConfirmationResult,
  otp: string
) => {
  return confirmationResult.confirm(otp);
};