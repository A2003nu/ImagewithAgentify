"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, Zap, FileText, MessageSquare, Workflow } from "lucide-react"

interface StepExplanation {
  step: number
  title: string
  description: string
}

interface ExplainWorkflowModalProps {
  isOpen: boolean
  onClose: () => void
  explanation: StepExplanation[]
  loading: boolean
}

const stepColors = [
  { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", text: "text-blue-800" },
  { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", text: "text-purple-800" },
  { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", text: "text-green-800" },
  { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600", text: "text-orange-800" },
  { bg: "bg-pink-50", border: "border-pink-200", icon: "text-pink-600", text: "text-pink-800" },
  { bg: "bg-cyan-50", border: "border-cyan-200", icon: "text-cyan-600", text: "text-cyan-800" },
]

export default function ExplainWorkflowModal({
  isOpen,
  onClose,
  explanation,
  loading,
}: ExplainWorkflowModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 border-purple-200">
        <DialogHeader className="border-b border-purple-100 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            <Workflow className="w-5 h-5 text-purple-600" />
            Workflow Explanation
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Analyzing your workflow...</p>
              <p className="text-gray-400 text-sm mt-1">
                Generating step-by-step explanation
              </p>
            </div>
          ) : explanation.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No workflow to explain</p>
              <p className="text-gray-400 text-sm mt-1">
                Add some nodes to your workflow first
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {explanation.map((item, index) => {
                const colorScheme = stepColors[index % stepColors.length]
                return (
                  <div
                    key={index}
                    className={`${colorScheme.bg} ${colorScheme.border} border rounded-xl p-4 shadow-sm transition-all hover:shadow-md`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`${colorScheme.bg} ${colorScheme.border} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border`}
                      >
                        <span className={`${colorScheme.text} font-bold text-sm`}>
                          {item.step}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`${colorScheme.text} font-semibold text-base mb-1`}>
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-purple-100">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-purple-200 hover:bg-purple-50"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}