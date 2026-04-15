"use client"

import { useState, useCallback, useEffect, useRef } from "react"

interface UseVoiceOutputReturn {
  isSupported: boolean
  isSpeaking: boolean
  speak: (text: string) => void
  stop: () => void
}

export function useVoiceOutput(): UseVoiceOutputReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window

  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.pitch = 0.8
    utterance.rate = 0.9

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error)
      setIsSpeaking(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [isSupported])

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isSupported])

  return {
    isSupported,
    isSpeaking,
    speak,
    stop,
  }
}