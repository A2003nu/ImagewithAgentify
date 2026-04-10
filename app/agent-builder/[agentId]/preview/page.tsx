"use client"

import React, { useEffect, useState } from "react"
import Header from "../../_components/Header"
import { useConvex, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useParams } from "next/navigation"
import { Agent } from "@/types/AgentType"
import { Background, BackgroundVariant, ReactFlow } from "@xyflow/react"
import { nodeTypes } from "../nodeTypes"
import CursorGlow from "../../_components/CursorGlow"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { RefreshCcwIcon } from "lucide-react"
import ChatUi from "./_components/ChatUi"
import CodePreviewModal from "@/components/CodePreviewModal"

function PreviewAgent() {

  const convex = useConvex()
  const { agentId } = useParams()

  const [agentDetail, setAgentDetail] = useState<Agent | undefined>()
  const [flowConfig, setFlowConfig] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showCodePreview, setShowCodePreview] = useState(false)
  const [generatedCode, setGeneratedCode] = useState("")

  const updateAgentToolConfig = useMutation(api.agent.UpdateAgentToolConfigs)

  // Fetch agent data
  useEffect(() => {
    if (agentId) {
      GetAgentDetail()
    }
  }, [agentId])

  const GetAgentDetail = async () => {
    const result = await convex.query(api.agent.GetAgentById, {
      agentId: agentId as string,
    })

    setAgentDetail(result as Agent)
  }

  // Generate workflow when agent loads
  useEffect(() => {
    if (agentDetail) {
      GenerateWorkflow()
    }
  }, [agentDetail])

  const GenerateWorkflow = () => {

    const edgeMap = agentDetail?.edges?.reduce((acc: any, edge: any) => {
      if (!acc[edge.source]) acc[edge.source] = []
      acc[edge.source].push(edge)
      return acc
    }, {})

    const flow = agentDetail?.nodes?.map((node: any) => {

      const connectedEdges = edgeMap?.[node.id] || []
      let next: any = null

      switch (node.type) {

        case "IfElseNode":

          const ifEdge = connectedEdges.find(
            (e: any) => e.sourceHandle === "if"
          )

          const elseEdge = connectedEdges.find(
            (e: any) => e.sourceHandle === "else"
          )

          next = {
            if: ifEdge?.target || null,
            else: elseEdge?.target || null,
          }

          break

        case "AgentNode":

          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target
          } else if (connectedEdges.length > 1) {
            next = connectedEdges.map((e: any) => e.target)
          }

          break

        case "ApiNode":
        case "UserApprovalNode":
        case "StartNode":

          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target
          }

          break

        case "EndNode":
          next = null
          break

        default:

          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target
          } else if (connectedEdges.length > 1) {
            next = connectedEdges.map((e: any) => e.target)
          }

          break
      }

      return {
        id: node.id,
        type: node.type,
        label: node.data?.label || node.type,
        settings: node.data?.settings || {},
        next,
      }

    })

    const startNode = agentDetail?.nodes?.find(
      (n: any) => n.type === "StartNode"
    )

    const workflowConfig = {
      startNode: startNode?.id || null,
      flow,
      userInputData: agentDetail?.complaintData || null,
    }

    console.log("✅ Generated Workflow Config:", workflowConfig)
    console.log("🧾 User Input Data:", workflowConfig.userInputData)

    setFlowConfig(workflowConfig)
  }

  const GenerateAgentToolConfig = async () => {

    if (!flowConfig) {
      console.log("Flow config not ready")
      return
    }

    if (!agentDetail?._id) {
      console.log("Agent not loaded")
      return
    }

    try {
      setLoading(true)

      const result = await axios.post(
        "/api/generate-agent-tool-config",
        {
          jsonConfig: flowConfig,
          userInputData: flowConfig.userInputData || null,
        }
      )

      console.log("Generated Agent Tool Config:", result.data)
      console.log("🧾 User Input Data passed:", flowConfig.userInputData);

      await updateAgentToolConfig({
        id: agentDetail._id as any,
        agentToolConfig: result.data,
      })

      await GetAgentDetail()

    } catch (error) {
      console.error("Failed to generate agent config:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>

      <CursorGlow />

      <Header 
        previewHeader={true} 
        agentDetail={agentDetail} 
        nodes={agentDetail?.nodes || []} 
        edges={agentDetail?.edges || []}
        onPreviewCode={(code) => {
          setGeneratedCode(code);
          setShowCodePreview(true);
        }} 
      />

      <div className="grid grid-cols-3 h-[90vh]">

        {/* Preview Canvas */}
        <div className="col-span-2 p-5 border rounded-2xl m-5">

          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Preview</h2>

            <button
              onClick={GenerateAgentToolConfig}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Generating..." : "Generate Agent Config"}
            </button>
          </div>

          <div style={{ width: "100%", height: "90vh" }}>

            <ReactFlow
              nodes={agentDetail?.nodes || []}
              edges={agentDetail?.edges || []}
              fitView
              nodeTypes={nodeTypes}
              draggable={false}
            >
              {/* @ts-ignore */}
              <Background
                variant={BackgroundVariant.Dots}
                gap={12}
                size={1}
                color="#cbd5e1"
              />
            </ReactFlow>

          </div>

        </div>

        {/* Chat Panel */}
        <div className="col-span-1 border rounded-2xl m-5 flex flex-col h-full">

          {!agentDetail?.agentToolConfig ? (
            <div className="flex justify-center p-4 border-b">
              <Button onClick={GenerateAgentToolConfig} disabled={loading}>
                <RefreshCcwIcon className={`${loading && "animate-spin"} mr-2`} />
                Reboot Agent
              </Button>
            </div>
          ) : (
            <ChatUi
              GenerateAgentToolConfig={GenerateAgentToolConfig}
              loading={loading}
              agentDetail={agentDetail}
            />
          )}

        </div>

      </div>

      <CodePreviewModal
        isOpen={showCodePreview}
        onClose={() => setShowCodePreview(false)}
        code={generatedCode}
      />

    </div>
  )
}

export default PreviewAgent