"use client"

import { useAuth, UserButton, SignInButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import WorkflowPreview from "@/components/WorkflowPreview"
import FeaturesSection from "@/components/FeaturesSection"
import HowItWorks from "@/components/HowItWorks"
import CTASection from "@/components/CTASection"
import CursorGlow from "@/components/CursorGlow"
import Loader from "@/components/Loader"
import StarBackground from "@/components/StarBackground"
import FloatingAgents from "@/components/FloatingAgents"

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200)
  }, [])

  // REMOVED: Auto-redirect to dashboard
  // Now landing page is always visible, button changes based on auth state

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (loading) {
    return <Loader />
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0f172a] to-[#1e1b4b] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-[#0f172a] to-[#1e1b4b] text-white overflow-hidden">
      <CursorGlow />
      <StarBackground />
      <FloatingAgents />

      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-[120px] top-[-100px] left-[-100px]" />
        <div className="absolute w-[400px] h-[400px] bg-blue-500/20 blur-[120px] bottom-[-100px] right-[-100px]" />
      </div>

      {/* Navbar with scroll blur */}
      <div
        className={`fixed w-full z-50 flex justify-between items-center px-8 py-4 transition-all ${
          scrolled
            ? "backdrop-blur-lg bg-black/40 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <h1 className="text-2xl font-bold tracking-wide">⚡ Agentify</h1>

        <div>
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
              >
                Dashboard
              </button>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition cursor-pointer">
                Login
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 grid md:grid-cols-2 items-center mt-20 px-6 gap-10 max-w-7xl mx-auto">
        
        {/* LEFT SIDE */}
        <div className="text-center md:text-left">
          
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Build AI Agents Visually
          </h1>

          <p className="mt-6 text-lg text-gray-300 max-w-xl">
            Design workflows. Connect intelligent agents. Execute powerful AI systems — all without writing complex code.
          </p>

          <div className="mt-8 flex gap-4 flex-wrap justify-center md:justify-start">
            
            {isSignedIn ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg transition shadow-lg shadow-purple-500/30"
              >
                🚀 Go to Dashboard
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg transition shadow-lg shadow-purple-500/30">
                  🔐 Get Started
                </button>
              </SignInButton>
            )}

            <button
              onClick={() =>
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-6 py-3 border border-gray-500 hover:border-white rounded-xl text-lg transition"
            >
              👀 Explore Features
            </button>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex justify-center">
          <WorkflowPreview />
        </div>

      </div>

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* CTA Section */}
      <CTASection />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}