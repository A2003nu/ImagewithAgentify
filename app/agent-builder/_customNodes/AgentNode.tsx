import { Handle, Position } from '@xyflow/react'
import { MousePointer2, Check, Loader2, X } from 'lucide-react'
import React from 'react'

function AgentNode({data}:any) {
  const status = data?.status || 'idle';
  
  const getStatusStyles = () => {
    switch (status) {
      case 'running':
        return {
          border: 'border-blue-500',
          shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
          icon: <Loader2 className='p-2 rounded-lg h-8 w-8 bg-blue-100 text-blue-600 animate-spin' />,
        };
      case 'success':
        return {
          border: 'border-green-500',
          shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
          icon: <Check className='p-2 rounded-lg h-8 w-8 bg-green-100 text-green-600' />,
        };
      case 'error':
        return {
          border: 'border-red-500',
          shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
          icon: <X className='p-2 rounded-lg h-8 w-8 bg-red-100 text-red-600' />,
        };
      default:
        return {
          border: 'border-gray-300',
          shadow: '',
          icon: <MousePointer2 className='p-2 rounded-lg h-8 w-8 bg-green-100'/>,
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="relative group">
      <div 
        className={`bg-white rounded-2xl p-2 px-3 border-2 transition-all duration-300
          ${styles.border} ${styles.shadow} ${status === 'running' ? 'animate-pulse' : ''}`}
      >
        <div className='flex gap-2 items-center'> 
          {styles.icon}

          <div className="flex flex-col">
            <h2>{data?.label}</h2>
            <p className="text-xs text-gray-500">Agent</p>
          </div>

          <Handle
            type="source"
            position={Position.Right}
            id="out"
          />

          <Handle
            type="target"
            position={Position.Left}
            id="in"
          />
        </div>
      </div>
    </div>
  )
}

export default AgentNode
