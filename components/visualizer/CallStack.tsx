'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { StackFrame } from '@/types/execution'
import { formatValue } from '@/lib/utils'

interface CallStackProps {
  frames: StackFrame[]
  activeFrameId?: string
}

export function CallStack({ frames, activeFrameId }: CallStackProps) {
  // Reverse to show most recent at top
  const reversedFrames = [...frames].reverse()

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header flex items-center justify-between">
        <span>Call Stack</span>
        <span className="text-xs text-gray-500">{frames.length} frames</span>
      </div>

      <div className="panel-content flex-1 overflow-auto">
        {frames.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No active call stack
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {reversedFrames.map((frame, index) => (
                <motion.div
                  key={frame.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    delay: index * 0.05,
                  }}
                >
                  <StackFrameCard
                    frame={frame}
                    isActive={frame.id === activeFrameId || index === 0}
                    depth={reversedFrames.length - index - 1}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

interface StackFrameCardProps {
  frame: StackFrame
  isActive: boolean
  depth: number
}

function StackFrameCard({ frame, isActive, depth }: StackFrameCardProps) {
  return (
    <div
      className={`stack-frame ${isActive ? 'stack-frame-active' : ''}`}
      style={{
        marginLeft: `${depth * 8}px`,
        opacity: isActive ? 1 : 0.7,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {frame.isAsync && (
            <span className="px-1.5 py-0.5 text-xs bg-purple-900/50 text-purple-300 rounded">
              async
            </span>
          )}
          <span className="font-medium text-accent-yellow">{frame.name}()</span>
        </div>
        <span className="text-xs text-gray-400">line {frame.location.line}</span>
      </div>

      {frame.args && frame.args.length > 0 && (
        <div className="text-xs text-gray-400">
          <span className="text-gray-500">args: </span>
          {frame.args.map((arg, i) => (
            <span key={i}>
              {i > 0 && ', '}
              <span className="text-accent-orange">{formatValue(arg)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
