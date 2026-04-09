"use client"

import { Button } from "@/components/ui/button"
import { Agent } from "@/types/AgentType"
import { Loader2Icon, RefreshCcwIcon, Send } from "lucide-react"
import React, { useState } from "react"

type Props = {
  GenerateAgentToolConfig: () => void
  loading: boolean
  agentDetail: Agent
}

function ChatUi({
  GenerateAgentToolConfig,
  loading,
  agentDetail,
}: Props) {

  const [userInput, setUserInput] = useState("")
  const [loadingMsg, setLoadingMsg] = useState(false)

  //  Chat messages
  const [messages, setMessages] = useState<any[]>([])

  const OnSendMsg = async () => {
    if (!userInput.trim()) return

    console.log("Sending:", userInput)

    //  Check config exists
    if (!agentDetail?.agentToolConfig) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: " Please click 'Generate Agent Config' first.",
        },
      ])
      return
    }

    setLoadingMsg(true)

    // Add user message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userInput },
    ])

    const currentInput = userInput
    setUserInput("")

    try {
      console.log("\n==============================");
      console.log("📤 Sending request to /api/agent-chat...");
      
      const res = await fetch("/api/agent-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: currentInput,
          agentToolConfig: agentDetail.agentToolConfig,
        }),
      })

      const data = await res.json()

      console.log("📥 Response received:", data);

      //  Handle API failure
      if (!data?.success) {
        console.error("❌ API returned error:", data.error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: " Failed to get response from agent.",
          },
        ])
        return
      }

      console.log("📤 Output:", data.reply?.substring(0, 200) + "...");

      //  Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.reply || "No response",
        },
      ])

    } catch (err) {
      console.error(" Chat error:", err)

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: " Something went wrong.",
        },
      ])
    } finally {
      setLoadingMsg(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full">

      {/* Header */}
      <div className="flex justify-between items-center border-b p-4">
        <h2>{agentDetail?.name}</h2>

        <Button onClick={GenerateAgentToolConfig} disabled={loading}>
          <RefreshCcwIcon className={loading ? "animate-spin" : ""} />
          Reboot Agent
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">

        {/*  Empty state */}
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
             Start conversation below...
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-xl max-w-[80%] ${
                msg.role === "user"
                  ? "bg-black text-white"
                  : "bg-zinc-200 text-black"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading */}
        {loadingMsg && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-800 border-b-transparent"></div>
            <span className="ml-2 text-sm text-zinc-700">
              Thinking...
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-3 flex items-center gap-2 bg-white sticky bottom-0">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="flex-1 border rounded-lg p-2 resize-none focus:outline-none max-h-24"
          placeholder="Type your message here..."
        />

        <Button
          onClick={OnSendMsg}
          disabled={loadingMsg || !userInput.trim()}
        >
          {loadingMsg ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <Send />
          )}
        </Button>
      </div>
    </div>
  )
}

export default ChatUi