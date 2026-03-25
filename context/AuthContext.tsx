"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { signOut, getIdToken, type User } from "firebase/auth"
import { getVendorMe } from "@/app/lib/vendorApi"
import { apiFetch } from "@/app/lib/api"
import { auth } from "@/lib/firebase"
import {
  AppUserProfile,
  UserRole,
  clearStoredUserProfile,
  formatPhoneNumber,
  getStoredUserProfile,
  storeUserProfile,
  subscribeToAuthState,
} from "@/lib/auth"



type AuthContextValue = {
  user: User | null
  profile: AppUserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  setProfile: (profile: AppUserProfile) => void
  refreshProfile: (uid?: string) => Promise<AppUserProfile | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfileState] = useState<AppUserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

const getUserMe = async (targetUid: string) => {
  try {
    return await apiFetch(`/users?userId=${targetUid}`)
  } catch (error) {
    console.error("Failed to fetch user from backend:", error)
    return null
  }
}

const refreshProfile = async (uid?: string) => {
  const targetUid = uid ?? auth.currentUser?.uid
  if (!targetUid) return null

  try {
    const token = await auth.currentUser!.getIdToken()
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }

    // Always fetch base profile from backend
    let userData = await getUserMe(targetUid)
    if (!userData || userData.error) {
      console.log("Backend user not found, checking local storage...")
      const storedProfile = getStoredUserProfile()
      if (storedProfile?.uid === targetUid) {
        console.log("Reusing stored profile")
        userData = {
          role: storedProfile.role,
          name: storedProfile.name,
          phoneNumber: storedProfile.phone,
        }
      } else {
        console.log("Creating fallback profile")
        userData = {
          uid: targetUid,
          role: "customer",
          name: "Eventra User",
          phoneNumber: "",
        }
      }
    }

    let nextProfile: AppUserProfile = {
      uid: targetUid,
      name: String(userData.name || "Eventra User"),
      phone: String(userData.phoneNumber || ""),
      role: userData.role as UserRole,
    }

    // Fetch vendor data if vendor role
    if (nextProfile.role === "vendor") {
      const vendorData = await getVendorMe()
      if (vendorData && !vendorData.error) {
        nextProfile.businessName = String(vendorData.businessName || "")
        nextProfile.name = String(vendorData.name || nextProfile.name)
      }
    }

    setProfileState(nextProfile)
    storeUserProfile(nextProfile)
    console.log("AUTH PROFILE FINAL:", nextProfile)
    return nextProfile
  } catch (error) {
    console.error("Profile refresh failed:", error)
    return null
  }
}

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser)

      if (!firebaseUser) {
        setProfileState(null)
        setIsLoading(false)
        return
      }

      const storedProfile = getStoredUserProfile()
      if (storedProfile?.uid === firebaseUser.uid) {
        setProfileState(storedProfile)
      }

      refreshProfile(firebaseUser.uid)
        .catch(() => {
          if (storedProfile?.uid === firebaseUser.uid) {
            setProfileState(storedProfile)
          }
        })
        .finally(() => {
          setIsLoading(false)
        })
    })

    return unsubscribe
  }, [])

  const setProfile = (nextProfile: AppUserProfile) => {
    setProfileState(nextProfile)
    storeUserProfile(nextProfile)
  }

  const logout = async () => {
    await signOut(auth)
    clearStoredUserProfile()
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("eventra_user")
    }
    setProfileState(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: Boolean(user),
        isLoading,
        setProfile,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
