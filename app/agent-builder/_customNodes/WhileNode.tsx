import { Input } from '@/components/ui/input'
import { Handle, Position } from '@xyflow/react'
import { Repeat, Check, Loader2 } from 'lucide-react'
import React from 'react'

function WhileNode({data}:any) {
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
      default:
        return {
          border: 'border-gray-300',
          shadow: '',
          icon: <Repeat className='p-2 rounded-lg h-8 w-8' style={{ backgroundColor: data?.bgColor }} />,
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
        <div className="flex gap-2 items-center">
          {styles.icon}
          <h2>While</h2>
        </div>

        <div className="max-w-[140px] flex flex-col gap-2 mt-2">
          <Input
            placeholder='While Condition'
            className='text-sm bg-white'
            disabled
          />
        </div>

        <Handle
          type="target"
          position={Position.Left}
          id="in"
        />

        <Handle
          type="source"
          position={Position.Right}
          id="loop"
        />
      </div>
    </div>
  )
}

export default WhileNode
