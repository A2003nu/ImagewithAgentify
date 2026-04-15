import { Handle, Position } from '@xyflow/react'
import { MousePointer2, Check, Loader2, X, AlertTriangle } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'

function AgentNode({ data }: any) {
  const status = data?.status || 'idle'
  const confidence = data?.confidence
  const reason = data?.reason
  const [showTooltip, setShowTooltip] = useState(false)
  const [displayValue, setDisplayValue] = useState(0)
  const [badgeVisible, setBadgeVisible] = useState(false)
  const prevConfidence = useRef(confidence)

  useEffect(() => {
    if (status !== 'success' || confidence == null) {
      setDisplayValue(0)
      setBadgeVisible(false)
      return
    }

    if (confidence !== prevConfidence.current) {
      setBadgeVisible(true)
      prevConfidence.current = confidence

      let start = 0
      const duration = 600
      const target = confidence
      const increment = target / (duration / 16)

      const timer = setInterval(() => {
        start += increment
        if (start >= target) {
          setDisplayValue(target)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [confidence, status])

  const getConfidenceStyles = (c: number | null) => {
    if (c == null) return { border: '', shadow: '', badge: '', icon: null }

    if (c >= 70) {
      return {
        border: 'border-cyan-400',
        shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.35)]',
        badge: 'bg-cyan-500 hover:bg-cyan-400',
        icon: null,
      }
    }
    if (c >= 40) {
      return {
        border: 'border-amber-400',
        shadow: 'shadow-[0_0_18px_rgba(245,158,11,0.35)]',
        badge: 'bg-amber-500 hover:bg-amber-400',
        icon: <AlertTriangle className="w-3 h-3" />,
      }
    }
    return {
      border: 'border-red-400',
      shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
      badge: 'bg-red-500 hover:bg-red-400',
      icon: null,
    }
  }

  const getStatusStyles = () => {
    switch (status) {
      case 'running':
        return {
          border: 'border-blue-500',
          shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
          icon: <Loader2 className='p-2 rounded-lg h-8 w-8 bg-blue-100 text-blue-600 animate-spin' />,
        }
      case 'success': {
        const confStyles = getConfidenceStyles(confidence)
        return {
          border: confidence != null ? confStyles.border : 'border-green-500',
          shadow: confidence != null ? confStyles.shadow : 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
          icon: <Check className='p-2 rounded-lg h-8 w-8 bg-green-100 text-green-600' />,
        }
      }
      case 'error':
        return {
          border: 'border-red-500',
          shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
          icon: <X className='p-2 rounded-lg h-8 w-8 bg-red-100 text-red-600' />,
        }
      default:
        return {
          border: 'border-gray-300',
          shadow: '',
          icon: <MousePointer2 className='p-2 rounded-lg h-8 w-8 bg-green-100' />,
        }
    }
  }

  const styles = getStatusStyles()
  const confStyles = getConfidenceStyles(confidence)
  const isLowConfidence = confidence != null && confidence < 40

  return (
    <div className="relative group">
      {badgeVisible && confidence != null && status === 'success' && (
        <div
          className={`absolute -top-2 -right-2 z-20 ${isLowConfidence ? 'animate-breathe' : ''}`}
          onMouseEnter={() => reason && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div
            className={`relative cursor-help flex items-center gap-0.5 ${confStyles.badge} text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg transition-all duration-200 hover:scale-110`}
            style={{
              animation: badgeVisible ? 'badgeEnter 0.3s ease-out forwards' : 'none',
            }}
          >
            <span className="tabular-nums">{displayValue}</span>
            <span>%</span>
            {confStyles.icon && (
              <span className="ml-0.5 flex items-center">{confStyles.icon}</span>
            )}
          </div>

          {showTooltip && reason && (
            <div
              className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl z-30 max-w-[200px]"
              style={{
                animation: 'tooltipEnter 0.2s ease-out forwards',
              }}
            >
              <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1">
                <span>Confidence</span>
                <span className="text-white/60">•</span>
                <span>{confidence}%</span>
              </div>
              <div className="text-gray-300 leading-relaxed">{reason}</div>
              <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900/95 rotate-45"></div>
            </div>
          )}
        </div>
      )}

      <div
        className={`bg-white rounded-2xl p-2 px-3 border-2 transition-all duration-300 ease-in-out ${styles.border} ${styles.shadow} ${status === 'running' ? 'animate-pulse' : ''} ${isLowConfidence ? 'animate-breathe' : ''}`}
      >
        <div className='flex gap-2 items-center'>
          {styles.icon}

          <div className="flex flex-col">
            <h2 className="font-medium">{data?.label}</h2>
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

      <style jsx>{`
        @keyframes badgeEnter {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes tooltipEnter {
          0% {
            opacity: 0;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes breathe {
          0%, 100% {
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.35);
          }
          50% {
            box-shadow: 0 0 22px rgba(239, 68, 68, 0.6);
          }
        }

        .animate-breathe {
          animation: breathe 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default AgentNode
