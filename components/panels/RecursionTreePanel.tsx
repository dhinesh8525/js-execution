'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'
import { useMemo } from 'react'
import type { RecursionFrame } from '@/engine/simulator'

/**
 * RecursionTreePanel - Visualizes the recursion call tree
 *
 * Features:
 * - Hierarchical tree of function calls
 * - Current frame highlighted
 * - Return values shown on completed frames
 * - Depth indicator
 */
export function RecursionTreePanel() {
  const recursionStack = useExecutionStore((s) => s.recursionStack)
  const maxRecursionDepth = useExecutionStore((s) => s.maxRecursionDepth)
  const executionMode = useExecutionStore((s) => s.executionMode)

  // Build tree structure from stack
  const rootFrames = useMemo(() => {
    return recursionStack.filter((frame) => frame.parentId === null)
  }, [recursionStack])

  // Only show in DSA mode
  if (executionMode !== 'DSA') {
    return null
  }

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v18M3 12h18M7 7l5 5-5 5M17 7l-5 5 5 5" />
          </svg>
          <span>RECURSION</span>
        </div>
        <span className="text-xs font-normal normal-case text-[#666]">
          DEPTH: {recursionStack.filter((f) => f.isActive).length} / MAX: {maxRecursionDepth}
        </span>
      </div>

      <div className="panel-content flex-1 overflow-auto">
        {recursionStack.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-2xl text-[#333] mb-1">🌳</div>
            <span className="text-xs text-[#666]">No recursion calls yet</span>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {recursionStack.map((frame) => (
                <RecursionFrameItem key={frame.id} frame={frame} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

interface RecursionFrameItemProps {
  frame: RecursionFrame
}

function RecursionFrameItem({ frame }: RecursionFrameItemProps) {
  const { functionName, args, depth, returnValue, isActive, isComplete, callLine } = frame

  // Format arguments
  const argsString = useMemo(() => {
    return Object.entries(args)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ')
  }, [args])

  // Determine frame styling based on state
  const getFrameStyle = () => {
    if (isActive) {
      return 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/20'
    }
    if (isComplete) {
      return 'bg-green-500/10 border-green-500/50'
    }
    return 'bg-[#1a1a1a] border-[#333]'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
      style={{ marginLeft: depth * 16 }}
      className={`
        rounded-lg border-2 p-3 transition-all relative
        ${getFrameStyle()}
      `}
    >
      {/* Depth indicator */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-[10px] text-[#555] font-mono">
        {depth}
      </div>

      {/* Active badge */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-cyan-500 text-[10px] font-bold text-black rounded"
        >
          ACTIVE
        </motion.div>
      )}

      {/* Return value badge */}
      {isComplete && returnValue !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-green-500 text-[10px] font-bold text-black rounded"
        >
          → {JSON.stringify(returnValue)}
        </motion.div>
      )}

      {/* Function call info */}
      <div className="flex items-center gap-2">
        <motion.div
          className={`w-2 h-2 rounded-full ${
            isActive ? 'bg-cyan-400' : isComplete ? 'bg-green-400' : 'bg-[#666]'
          }`}
          animate={isActive ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className={`font-medium ${isActive ? 'text-cyan-400' : 'text-white'}`}>
          {functionName}({argsString})
        </span>
      </div>

      {/* Line number */}
      {callLine > 0 && <div className="text-xs text-[#666] mt-1">Line {callLine}</div>}
    </motion.div>
  )
}
