"use client"

import { convertWorkflowToFlow } from "@/lib/workflow"
import React, { useCallback, useContext, useEffect, useState } from "react"
import Header from "./_components/Header"
import { WorkflowContext } from "@/context/WorkflowContext"
import { UserDetailContext } from "@/context/UserDetailContext"
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  Panel,
  OnSelectionChangeParams,
  useOnSelectionChange,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { useRouter, useSearchParams } from "next/navigation"
import { nodeTypes } from "./[agentId]/nodeTypes"
import AgentToolsPanel from "./_components/AgentToolsPanel"
import { useConvex, useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Agent } from "@/types/AgentType"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import SettingPanel from "./_components/SettingPanel"
import ExplainWorkflowModal from "./[agentId]/_components/ExplainWorkflowModal"
import { WorkflowInputModal } from "./[agentId]/_components/WorkflowInputModal"
import PublishModal from "@/components/PublishModal"
import CursorGlow from "./_components/CursorGlow"
import CodePreviewModal from "@/components/CodePreviewModal"

export default function AgentBuilderPage() {
  const {
    addedNodes,
    setAddedNodes,
    nodeEdges,
    setNodeEdges,
    setSelectedNode,
  } = useContext(WorkflowContext) as any

  const { userDetail } = useContext(UserDetailContext) as any
  const searchParams = useSearchParams()
  const router = useRouter()

  const [showOutputPanel, setShowOutputPanel] = useState(false)
  const [showWorkflowModal, setShowWorkflowModal] = useState(false)
  const [showCodePreview, setShowCodePreview] = useState(false)
  const [generatedCode, setGeneratedCode] = useState("")
  const [isExplainOpen, setIsExplainOpen] = useState(false)
  const [explanation, setExplanation] = useState<{ step: number; title: string; description: string }[]>([])
  const [loadingExplain, setLoadingExplain] = useState(false)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [shareLink, setShareLink] = useState("")

  const convex = useConvex()
  const createTemplate = useMutation(api.template.createTemplate)
  const userTemplates = useQuery(api.template.getTemplates)

  useEffect(() => {
    const encoded = searchParams.get("data")
    const templateId = searchParams.get("templateId")

    if (templateId && userTemplates) {
      const template = userTemplates.find((t: any) => t._id === templateId)
      if (template) {
        setAddedNodes(Array.isArray(template.nodes) ? template.nodes : [])
        setNodeEdges(Array.isArray(template.edges) ? template.edges : [])
        toast.success("Template loaded!")
        router.replace("/agent-builder")
      }
    } else if (encoded && userDetail?._id) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))))
        if (decoded.nodes) setAddedNodes(decoded.nodes)
        if (decoded.edges) setNodeEdges(decoded.edges)
      } catch (e) {
        console.error("Invalid shared workflow data")
      }
    } else if (!templateId && !encoded) {
      router.push("/dashboard")
    }
  }, [userDetail, userTemplates, searchParams, router])

  const onNodesChange = useCallback(
    (changes: any) => {
      setAddedNodes((nodes: any) => applyNodeChanges(changes, nodes))
    },
    [setAddedNodes]
  )

  const onEdgesChange = useCallback(
    (changes: any) => {
      setNodeEdges((edges: any) => applyEdgeChanges(changes, edges))
    },
    [setNodeEdges]
  )

  const onConnect = useCallback(
    (params: any) => setNodeEdges((eds: any) => addEdge(params, eds)),
    [setNodeEdges]
  )

  const onNodesDelete = useCallback(
    (deleted: any) => {
      setAddedNodes((nodes: any) =>
        nodes.filter((node: any) => !deleted.find((d: any) => d.id === node.id))
      )
    },
    [setAddedNodes]
  )

  const handleGenerateWorkflow = async (config: any) => {
    try {
      const response = await fetch("/api/auto-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error("Failed to generate workflow")
      }

      const data = await response.json()
      const { nodes: generatedNodes, edges: generatedEdges } = convertWorkflowToFlow(data.workflow)

      setAddedNodes(generatedNodes)
      setNodeEdges(generatedEdges)
      setShowWorkflowModal(false)
      toast.success("Workflow generated!")
    } catch (error) {
      console.error("Error generating workflow:", error)
      toast.error("Failed to generate workflow")
    }
  }

  const generateExplanation = async (nodes: any[], edges: any[]) => {
    if (nodes.length === 0) return []

    const response = await fetch("/api/explain-workflow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes, edges }),
    })

    if (!response.ok) throw new Error("Failed to generate explanation")
    const data = await response.json()
    return data.explanation
  }

  const handleExplainWorkflow = async () => {
    if (addedNodes.length === 0) {
      toast.error("No workflow to explain")
      return
    }

    setLoadingExplain(true)
    setIsExplainOpen(true)

    try {
      const result = await generateExplanation(addedNodes, nodeEdges)
      setExplanation(result)
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate explanation")
    } finally {
      setLoadingExplain(false)
    }
  }

  const handlePublish = async () => {
    if (!addedNodes || addedNodes.length === 0) {
      toast.error("No workflow to publish")
      return
    }

    try {
      await createTemplate({
        name: "Untitled Template",
        description: "Generated from Agentify workflow",
        nodes: addedNodes,
        edges: nodeEdges,
        createdAt: Date.now(),
        userId: userDetail?._id,
      })

      const data = JSON.stringify({ nodes: addedNodes, edges: nodeEdges })
      const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(data))))
      const url = `${window.location.origin}/agent-builder?data=${encoded}`

      setShareLink(url)
      setIsPublishModalOpen(true)
      toast.success("Workflow published!")
    } catch (error) {
      console.error("Publish failed:", error)
      toast.error("Failed to publish workflow")
    }
  }

  const onNodeSelect = useCallback(
    ({ nodes }: OnSelectionChangeParams) => {
      setSelectedNode(nodes[0])
    },
    []
  )

  useOnSelectionChange({ onChange: onNodeSelect })

  if (!userDetail) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <CursorGlow />
      <Header 
        agentName="New Agent"
        nodes={addedNodes} 
        edges={nodeEdges} 
        onPreviewCode={(code) => {
          setGeneratedCode(code)
          setShowCodePreview(true)
        }}
        onPublish={handlePublish}
      />

      <div className="bg-slate-100" style={{ width: "100vw", height: "90vh" }}>
        <ReactFlow
          nodes={addedNodes}
          edges={nodeEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#cbd5e1" />

          <Panel position="top-left">
            <AgentToolsPanel />
          </Panel>

          <Panel position="top-right">
            <div className="flex gap-2">
              <SettingPanel />
              <Button onClick={() => setShowWorkflowModal(true)} variant="secondary">
                ⚡ Generate Workflow
              </Button>
              <Button onClick={handleExplainWorkflow} variant="outline">
                🧠 Explain Workflow
              </Button>
              <Button onClick={handlePublish} variant="outline">
                🚀 Publish
              </Button>
            </div>
          </Panel>

          <Panel position="bottom-center">
            <Button disabled>
              Save Workflow
            </Button>
          </Panel>
        </ReactFlow>
      </div>

      <WorkflowInputModal
        open={showWorkflowModal}
        onOpenChange={setShowWorkflowModal}
        onSubmit={handleGenerateWorkflow}
      />

      <CodePreviewModal
        isOpen={showCodePreview}
        onClose={() => setShowCodePreview(false)}
        code={generatedCode}
      />

      <ExplainWorkflowModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        explanation={explanation}
        loading={loadingExplain}
      />

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        link={shareLink}
      />
    </div>
  )
}