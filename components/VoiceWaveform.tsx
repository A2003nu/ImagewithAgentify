"use client"

interface VoiceWaveformProps {
  isAnimating?: boolean
}

export function VoiceWaveform({ isAnimating = false }: VoiceWaveformProps) {
  return (
    <div className="flex items-center gap-0.5 h-6">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`
            w-1 bg-primary rounded-full transition-all duration-150
            ${isAnimating ? "animate-pulse" : "h-2"}
          `}
          style={{
            height: isAnimating 
              ? `${Math.random() * 100}%` 
              : undefined,
            animationDelay: isAnimating 
              ? `${i * 100}ms` 
              : undefined,
          }}
        />
      ))}
    </div>
  )
}