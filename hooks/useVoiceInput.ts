"use client"

import { useState, useCallback, useEffect, useRef } from "react"

interface UseVoiceInputReturn {
  isSupported: boolean
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
}

export function useVoiceInput(): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const isSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)

  const startListening = useCallback(() => {
    setError(null)

    if (!isSupported) {
      setError("Speech recognition not supported")
      return
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionClass) {
      setError("Speech recognition not available")
      return
    }

    const recognition = new SpeechRecognitionClass()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1]
      if (result.isFinal && result[0].transcript.trim()) {
        setTranscript(result[0].transcript.trim())
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      if (event.error === "network") {
        setError("Speech service unavailable. Try Chrome/Edge or disable Brave Shields.")
      } else if (event.error === "not-allowed") {
        setError("Microphone blocked - check Brave Shields")
      } else {
        setError(`Error: ${event.error}`)
      }
      setIsListening(false)
    }

    recognitionRef.current = recognition
    
    try {
      recognition.start()
    } catch (e) {
      setError("Failed to start speech recognition")
      setIsListening(false)
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setError(null)
  }, [])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
    }
  }, [])

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  }
}