"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/market/Navbar"
import Hero from "@/components/market/Hero"
import Stats from "@/components/market/Stats"
import Features from "@/components/market/Features"
import CTA from "@/components/market/CTA"
import Footer from "@/components/market/Footer"
import HomeCarousel from "@/components/market/HomeCarousel"
import { useAuth } from "@/context/AuthContext"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <>
      <Navbar />
      <Hero />
      <HomeCarousel /> 
      <Stats />
      <Features />
      <CTA />
      <Footer />
    </>
  );
}
