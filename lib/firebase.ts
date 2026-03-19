import { getApp, getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCn5dbwF23QGe4zUDPfbjlf9XfP4k7kmik",
  authDomain: "eventra-3b4de.firebaseapp.com",
  projectId: "eventra-3b4de",
  storageBucket: "eventra-3b4de.firebasestorage.app",
  messagingSenderId: "589596282613",
  appId: "1:589596282613:web:587cfb0856cf7132f87fbc",
  measurementId: "G-MKF0EK3C7Z",
}

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
