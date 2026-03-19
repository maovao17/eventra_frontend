"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { signOut, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import {
  AppUserProfile,
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
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfileState] = useState<AppUserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser)

      if (!firebaseUser) {
        setProfileState(null)
        setIsLoading(false)
        return
      }

      const storedProfile = getStoredUserProfile()
      const nextProfile: AppUserProfile = {
        uid: firebaseUser.uid,
        name: storedProfile?.uid === firebaseUser.uid
          ? storedProfile.name
          : storedProfile?.name ?? "Eventra User",
        phone: formatPhoneNumber(
          firebaseUser.phoneNumber ?? storedProfile?.phone ?? ""
        ),
        role: storedProfile?.role ?? "individual",
        businessName: storedProfile?.businessName,
      }

      setProfileState(nextProfile)
      storeUserProfile(nextProfile)
      setIsLoading(false)
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
