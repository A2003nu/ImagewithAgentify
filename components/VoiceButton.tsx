"use client"

import { Mic, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceButtonProps {
  isListening?: boolean
  isProcessing?: boolean
  onClick: () => void
  disabled?: boolean
}

export function VoiceButton({ 
  isListening = false, 
  isProcessing = false, 
  onClick, 
  disabled = false 
}: VoiceButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant={isListening ? "default" : "outline"}
      className={`
        relative overflow-hidden transition-all duration-200
        ${isListening ? "animate-pulse bg-red-500 hover:bg-red-600" : ""}
        ${!isListening && !isProcessing ? "hover:scale-105 hover:border-red-400 hover:text-red-500" : ""}
        ${isProcessing ? "opacity-70" : ""}
      `}
      onClick={onClick}
      disabled={disabled || isProcessing}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mic className={`h-4 w-4 ${isListening ? "text-white" : ""}`} />
      )}
      {isListening && (
        <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20" />
      )}
    </Button>
  )
}