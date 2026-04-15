"use client"

interface VoiceIndicatorProps {
  status: "idle" | "listening" | "processing" | "speaking"
  transcript?: string
  visible?: boolean
}

export function VoiceIndicator({ status, transcript, visible = true }: VoiceIndicatorProps) {
  if (!visible || status === "idle") return null

  const statusLabels = {
    listening: "Listening...",
    processing: "Processing...",
    speaking: "Speaking...",
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm animate-in fade-in slide-in-from-top-1">
      <div className={`
        w-2 h-2 rounded-full 
        ${status === "listening" ? "bg-red-500 animate-pulse" : ""}
        ${status === "processing" ? "bg-yellow-500 animate-pulse" : ""}
        ${status === "speaking" ? "bg-green-500 animate-pulse" : ""}
      `} />
      <span className="text-muted-foreground">
        {statusLabels[status]}
      </span>
      {transcript && status === "listening" && (
        <span className="text-foreground truncate max-w-[200px]">
          &quot;{transcript}&quot;
        </span>
      )}
    </div>
  )
}