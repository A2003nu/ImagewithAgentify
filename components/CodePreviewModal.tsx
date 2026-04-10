"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Copy, Download } from "lucide-react"

interface CodePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  code: string
  title?: string
}

/**
 * CodePreviewModal - Displays generated Python code in a modal
 * Reuses generatePythonCode from pythonExporter
 */
export default function CodePreviewModal({
  isOpen,
  onClose,
  code,
  title = "Generated Python Code"
}: CodePreviewModalProps) {

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/x-python" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "agentify_workflow.py"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Preview of the generated Python workflow code
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download .py
          </Button>
        </div>

        {/* Code Display */}
        <div className="flex-1 overflow-hidden rounded-lg border bg-[#1e1e1e]">
          <pre className="h-[400px] overflow-auto p-4 text-sm text-[#d4d4d4] font-mono">
            <code>{code || "# No code to preview"}</code>
          </pre>
        </div>

        {/* Footer with Close button */}
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}