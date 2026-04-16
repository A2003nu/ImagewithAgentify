"use client"

import { AlertTriangle, Info } from "lucide-react"

interface MedicalDisclaimerBannerProps {
  className?: string
}

export function MedicalDisclaimerBanner({ className = "" }: MedicalDisclaimerBannerProps) {
  return (
    <div className={`bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            This is not medical advice
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            This tool analyzes symptom patterns and provides general guidance only. 
            It does not diagnose diseases or replace professional medical consultation. 
            Always seek qualified healthcare providers for medical concerns.
          </p>
        </div>
      </div>
    </div>
  )
}

interface MedicalInfoBannerProps {
  className?: string
}

export function MedicalInfoBanner({ className = "" }: MedicalInfoBannerProps) {
  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 ${className}`}>
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Medical Report Analysis Agent
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            This workflow extracts symptom patterns, maps them to general medical categories, 
            identifies red flags, and recommends appropriate healthcare professionals.
          </p>
        </div>
      </div>
    </div>
  )
}
