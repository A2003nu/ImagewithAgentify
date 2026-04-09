import { WorkflowContext } from '@/context/WorkflowContext'
import React, { useContext, useEffect, useRef } from 'react'
import AgentSettings from '../_nodeSettings/AgentSettings'
import EndSettings from '../_nodeSettings/EndSettings'
import IfElseSettings from '../_nodeSettings/IfElseSettings'
import WhileSettings from '../_nodeSettings/WhileSettings'
import UserApproval from '../_nodeSettings/UserApproval'
import ApiAgentSettings from '../_nodeSettings/ApiAgentSettings'
import { X } from 'lucide-react'

function SettingPanel() {
  const { selectedNode, setAddedNodes, setSelectedNode } = useContext(WorkflowContext) as any
  const panelRef = useRef<HTMLDivElement>(null)

  const handleClose = () => {
    setSelectedNode(null)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement
        if (!target.closest('.react-flow__node') && !target.closest('button')) {
          return
        }
        if (!target.closest('.react-flow__node')) {
          handleClose()
        }
      }
    }

    if (selectedNode) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedNode])

  const onUpdatedNodeData = (formData: any) => {
    if (!selectedNode) return

    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        label: formData.name,
        settings: formData
      }
    }

    setAddedNodes((prevNodes: any) =>
      prevNodes.map((node: any) =>
        node.id === selectedNode.id ? updatedNode : node
      )
    )
  }

  if (!selectedNode) return null

  return (
    <div 
      className="relative"
      ref={panelRef}
    >
      <div className='p-5 bg-white rounded-2xl w-[350px] shadow-lg border'>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">
            {selectedNode?.type === 'AgentNode' && 'Agent Settings'}
            {selectedNode?.type === 'EndNode' && 'End Node'}
            {selectedNode?.type === 'IfElseNode' && 'Condition Settings'}
            {selectedNode?.type === 'WhileNode' && 'Loop Settings'}
            {selectedNode?.type === 'UserApprovalNode' && 'User Approval'}
            {selectedNode?.type === 'ApiNode' && 'API Settings'}
            {selectedNode?.type === 'StartNode' && 'Start Node'}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            title="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {selectedNode?.type === 'StartNode' && (
          <div className="text-sm text-gray-500">
            <p>The workflow starts here automatically.</p>
            <p className="mt-2 text-xs">No additional configuration needed.</p>
          </div>
        )}

        {selectedNode?.type === 'AgentNode' && (
          <AgentSettings
            selectedNode={selectedNode}
            updateFormData={(value: any) => onUpdatedNodeData(value)}
          />
        )}

        {selectedNode?.type === 'EndNode' && (
          <EndSettings 
            selectedNode={selectedNode}
            updateFormData={(value: any) => onUpdatedNodeData(value)}
          />
        )}
        
        {selectedNode?.type === 'IfElseNode' && 
          <IfElseSettings 
            selectedNode={selectedNode}
            updateFormData={(value: any) => onUpdatedNodeData(value)}
          />
        }

        {selectedNode?.type === 'WhileNode' && 
          <WhileSettings
            selectedNode={selectedNode}
            updateFormData={(value: any) => onUpdatedNodeData(value)}
          />
        }

        {selectedNode?.type === 'UserApprovalNode' && 
          <UserApproval
            selectedNode={selectedNode}
            updateFormData={(value: any) => onUpdatedNodeData(value)}
          />
        }
        
        {selectedNode?.type === 'ApiNode' && 
          <ApiAgentSettings
            selectedNode={selectedNode}
            updateFormData={(value: any) => onUpdatedNodeData(value)}
          />
        }
      </div>
    </div>
  )
}

export default SettingPanel
