import { Handle, Position } from '@xyflow/react'
import { Play, Check } from 'lucide-react'
import React from 'react'

function StartNode({data}:any) {
  const status = data?.status || 'idle';
  
  const getStatusStyles = () => {
    switch (status) {
      case 'running':
        return {
          border: 'border-blue-500',
          shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
        };
      case 'success':
        return {
          border: 'border-green-500',
          shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
        };
      default:
        return {
          border: 'border-gray-300',
          shadow: '',
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
          {status === 'success' ? (
            <Check className='p-2 rounded-lg h-8 w-8 bg-green-100 text-green-600' />
          ) : (
            <Play className='p-2 rounded-lg h-8 w-8 bg-yellow-100' />
          )}

          <h2>Start</h2>

          <Handle
            type="source"
            position={Position.Right}
            id="out"
          />
        </div>
      </div>
    </div>
  )
}

export default StartNode
