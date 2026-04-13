"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  clerkUserId?: string
}

export default function UpgradeModal({ isOpen, onClose, clerkUserId }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState("free")
  const [showPaymentLoading, setShowPaymentLoading] = useState(false)

  const addCreditsMutation = useMutation(api.users.addCredits)

  if (!isOpen) return null

  const handleContinue = async () => {
    if (selectedPlan === "free") {
      onClose()
      return
    }

    setShowPaymentLoading(true)

    setTimeout(async () => {
      let creditsToAdd = 0

      if (selectedPlan === "pro") creditsToAdd = 50000
      if (selectedPlan === "unlimited") creditsToAdd = 999999

      if (clerkUserId && creditsToAdd > 0) {
        try {
          await addCreditsMutation({
            clerkId: clerkUserId,
            amount: creditsToAdd,
          })
          toast.success(`+${creditsToAdd.toLocaleString()} credits added ⚡`)
        } catch (error) {
          toast.error("Failed to add credits")
        }
      }

      setShowPaymentLoading(false)
      onClose()
    }, 2000)
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-[#111] p-6 rounded-xl w-[400px] border border-white/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {showPaymentLoading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-xl z-50">
            <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-white">Processing payment...</p>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4 text-white">Upgrade Plan 🚀</h2>

        <div className="space-y-3">
          <div
            onClick={() => setSelectedPlan("free")}
            className={`border p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedPlan === "free" ? "border-purple-500 bg-purple-500/10" : "border-white/10 hover:border-white/30"
            }`}
          >
            <h3 className="text-white font-semibold">Free</h3>
            <p className="text-gray-400 text-sm">5000 credits/month</p>
          </div>

          <div
            onClick={() => setSelectedPlan("pro")}
            className={`border p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedPlan === "pro" ? "border-purple-500 bg-purple-500/10" : "border-white/10 hover:border-white/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold">Pro</h3>
              <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded">Popular</span>
            </div>
            <p className="text-gray-400 text-sm">50,000 credits/month</p>
            <p className="text-purple-400 text-sm mt-1">$9.99/month</p>
          </div>

          <div
            onClick={() => setSelectedPlan("unlimited")}
            className={`border p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedPlan === "unlimited" ? "border-purple-500 bg-purple-500/10" : "border-white/10 hover:border-white/30"
            }`}
          >
            <h3 className="text-white font-semibold">Unlimited</h3>
            <p className="text-gray-400 text-sm">No limits</p>
            <p className="text-yellow-400 text-sm mt-1">$29.99/month</p>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={showPaymentLoading}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg transition disabled:opacity-50"
        >
          Continue 🚀
        </button>

        <Button
          onClick={onClose}
          variant="ghost"
          className="mt-2 w-full text-gray-400 hover:text-white"
        >
          Close
        </Button>
      </div>
    </div>
  )
}