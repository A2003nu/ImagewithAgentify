"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Shield, Stethoscope } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface MedicalDisclaimerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: () => void
}

export function MedicalDisclaimerModal({
  open,
  onOpenChange,
  onAccept,
}: MedicalDisclaimerModalProps) {
  const [accepted, setAccepted] = useState(false)

  const handleAccept = () => {
    if (accepted) {
      onAccept()
      onOpenChange(false)
      setAccepted(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setAccepted(false)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Important Medical Disclaimer
          </DialogTitle>
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <Stethoscope className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  This tool is NOT a medical diagnostic system
                </p>
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
                  <li>It does not replace professional medical advice</li>
                  <li>It does not provide diagnoses</li>
                  <li>It does not suggest treatments or medications</li>
                  <li>Always consult a qualified healthcare provider</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <Shield className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                  What this tool DOES:
                </p>
                <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-1 list-disc list-inside">
                  <li>Extract symptom patterns from your description</li>
                  <li>Map symptoms to general medical categories</li>
                  <li>Identify symptoms that may need medical attention</li>
                  <li>Recommend appropriate healthcare professionals</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Checkbox
              id="accept-disclaimer"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="accept-disclaimer"
              className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer leading-relaxed"
            >
              I understand that this is a pattern analysis tool only, not a medical diagnosis. 
              I will consult a qualified healthcare professional for any medical concerns. 
              I acknowledge that this tool cannot and does not provide medical advice.
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!accepted}
            className={`${!accepted ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            I Understand - Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
