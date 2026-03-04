import Navbar from "@/components/market/Navbar";
import Hero from "@/components/market/Hero";
import Stats from "@/components/market/Stats";
import Features from "@/components/market/Features";
import CTA from "@/components/market/CTA";
import Footer from "@/components/market/Footer";
import HomeCarousel from "@/components/market/HomeCarousel";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <HomeCarousel /> 
      <Stats />
      <Features />
      <CTA />ß
      <Footer />
    </>
  );
}