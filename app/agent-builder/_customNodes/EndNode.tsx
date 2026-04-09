import { Handle, Position } from '@xyflow/react'
import { Square, Check } from 'lucide-react'
import React from 'react'

function EndNode({data}:any) {
  const status = data?.status || 'idle';
  
  const getStatusStyles = () => {
    switch (status) {
      case 'running':
        return {
          border: 'border-blue-500',
          shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
          icon: <Square className='p-2 rounded-lg h-8 w-8 bg-blue-100 text-blue-600 animate-pulse' />,
        };
      case 'success':
        return {
          border: 'border-green-500',
          shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
          icon: <Check className='p-2 rounded-lg h-8 w-8 bg-green-100 text-green-600' />,
        };
      default:
        return {
          border: 'border-gray-300',
          shadow: '',
          icon: <Square className='p-2 rounded-lg h-8 w-8 bg-rose-100' style={{ backgroundColor: data?.bgColor }} />,
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="relative group">
      <div 
        className={`bg-white rounded-2xl p-2 px-3 border-2 transition-all duration-300
          ${styles.border} ${styles.shadow}`}
      >
        <div className='flex gap-2 items-center'>
          {styles.icon}

          <h2>End</h2>

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

export default EndNode
