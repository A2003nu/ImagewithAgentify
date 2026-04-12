import { Button } from '@/components/ui/button'
import { Agent } from '@/types/AgentType'
import { ChevronLeft, Code2, Play, X } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { generatePythonCode, downloadPythonFile } from '@/lib/pythonExporter'

interface FlowNode {
  id: string;
  type?: string;
  data?: {
    label?: string;
    name?: string;
    prompt?: string;
    instruction?: string;
    systemPrompt?: string;
    url?: string;
    [key: string]: any;
  };
}

interface FlowEdge {
  source: string;
  target: string;
  [key: string]: any;
}

type Props = {
    agentDetail?: Agent,
    agentName?: string,
    previewHeader?: boolean,
    nodes?: FlowNode[];
    edges?: FlowEdge[];
    onPreviewCode?: (code: string) => void;
    onPublish?: () => void;
}

function Header({agentDetail, agentName, previewHeader=false, nodes = [], edges = [], onPreviewCode, onPublish}:Props) {
  
  const agentNameDisplay = agentName || agentDetail?.name || "Agentify";
  
  const handleCodeClick = () => {
    const code = generatePythonCode(nodes, edges);
    downloadPythonFile(code, `${agentNameDisplay}_workflow.py`);
  }

  const handlePreviewClick = () => {
    const code = generatePythonCode(nodes, edges);
    if (onPreviewCode) {
      onPreviewCode(code);
    }
  };

  const handlePublishClick = () => {
    if (onPublish) {
      onPublish();
    }
  };

  return (
   <div className="w-full p-3 flex items-center justify-between">
    <div className="flex gap-2 items-center">
        <ChevronLeft className='h-8 w-8' />
        <h2 className="text-xl">{agentNameDisplay}</h2>
    </div>

    <div className="flex items-center gap-3">
        <Button variant={'ghost'} onClick={handleCodeClick}><Code2 />Code</Button>
        {!previewHeader? (
          <Button variant="outline" onClick={handlePreviewClick}>
            <Play className="h-4 w-4 mr-2" />
            Preview Code
          </Button>
        ) : (
        <Link href={`/agent-builder/${agentDetail?.agentId}`}>
        <Button variant={'outline'}><X />Close Preview</Button>
        </Link>)}
        <Button onClick={handlePublishClick}>Publish</Button>
    </div>
   </div>
  )
}

export default Header