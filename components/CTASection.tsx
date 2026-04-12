"use client"

import { useAuth, SignInButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function CTASection() {
  const router = useRouter()
  const { isSignedIn } = useAuth()

  return (
    <div className="relative py-32 text-center text-white overflow-hidden">
      
      {/* Glow Background */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-[120px] top-0 left-1/2 transform -translate-x-1/2" />
      </div>

      <div className="relative z-10 px-6">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Start Building Your AI Agents Today
        </h2>

        <p className="text-gray-300 mb-10 text-lg">
          Turn your ideas into powerful workflows in minutes.
        </p>

        {isSignedIn ? (
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-xl transition shadow-lg shadow-purple-500/40"
          >
            🚀 Go to Dashboard
          </button>
        ) : (
          <SignInButton mode="modal">
            <button className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-xl transition shadow-lg shadow-purple-500/40 cursor-pointer">
              🔐 Get Started
            </button>
          </SignInButton>
        )}
      </div>
    </div>
  )
}