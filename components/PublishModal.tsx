"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check, Rocket } from "lucide-react"
import { useState } from "react"

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  link: string
}

export default function PublishModal({ isOpen, onClose, link }: PublishModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 border-purple-200">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-3">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Workflow Published!
          </DialogTitle>
          <p className="text-gray-500 text-sm mt-1">
            Share this link with others to let them view your workflow
          </p>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-lg p-2">
            <input
              type="text"
              value={link}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-600 outline-none px-2 truncate"
            />
            <Button
              size="sm"
              variant={copied ? "secondary" : "default"}
              onClick={handleCopy}
              className={copied ? "bg-green-500 hover:bg-green-600" : "bg-purple-600 hover:bg-purple-700"}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
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