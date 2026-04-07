'use client'

import { motion } from 'framer-motion'
import type { ExecutionMode, AlgorithmType } from '@/engine/simulator'

interface ModeSelectorProps {
  detectedMode: ExecutionMode
  currentMode: ExecutionMode
  confidence: number
  algorithmType: AlgorithmType | null
  onModeChange: (mode: ExecutionMode) => void
}

/**
 * ModeSelector - UI component for viewing and toggling execution mode
 *
 * Features:
 * - Shows auto-detected mode with confidence badge
 * - Toggle switch for manual override
 * - Algorithm type indicator when in DSA mode
 */
export function ModeSelector({
  detectedMode,
  currentMode,
  confidence,
  algorithmType,
  onModeChange,
}: ModeSelectorProps) {
  const isJSRuntime = currentMode === 'JS_RUNTIME'
  const confidencePercent = Math.round(confidence * 100)

  // Get algorithm type display
  const getAlgorithmLabel = () => {
    if (!algorithmType) return null
    const labels: Record<AlgorithmType, string> = {
      SORTING: 'Sorting',
      SEARCHING: 'Searching',
      TREE_TRAVERSAL: 'Tree',
      GRAPH_TRAVERSAL: 'Graph',
      RECURSION: 'Recursion',
      DYNAMIC_PROGRAMMING: 'DP',
      LINKED_LIST: 'Linked List',
      STACK_QUEUE: 'Stack/Queue',
      GENERIC: 'Algorithm',
    }
    return labels[algorithmType]
  }

  return (
    <div className="flex items-center gap-2">
      {/* Mode Toggle */}
      <div
        className="relative flex items-center bg-[#1a1a1a] rounded-lg p-1 border border-[#333] cursor-pointer"
        onClick={() => onModeChange(isJSRuntime ? 'DSA' : 'JS_RUNTIME')}
      >
        {/* Sliding background */}
        <motion.div
          className={`
            absolute h-6 rounded-md transition-colors
            ${isJSRuntime ? 'bg-blue-500/30' : 'bg-green-500/30'}
          `}
          initial={false}
          animate={{
            x: isJSRuntime ? 0 : '100%',
            width: '50%',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />

        {/* JS Runtime option */}
        <button
          className={`
            relative z-10 px-2 py-1 text-xs font-medium rounded-md transition-colors
            ${isJSRuntime ? 'text-blue-400' : 'text-[#666]'}
          `}
        >
          Event Loop
        </button>

        {/* DSA option */}
        <button
          className={`
            relative z-10 px-2 py-1 text-xs font-medium rounded-md transition-colors
            ${!isJSRuntime ? 'text-green-400' : 'text-[#666]'}
          `}
        >
          Algorithm
        </button>
      </div>

      {/* Confidence badge */}
      <div
        className="px-1.5 py-0.5 text-[10px] bg-[#1a1a1a] border border-[#333] rounded"
        title={`Mode detected with ${confidencePercent}% confidence`}
      >
        <span className="text-[#666]">Auto:</span>{' '}
        <span className={detectedMode === 'JS_RUNTIME' ? 'text-blue-400' : 'text-green-400'}>
          {detectedMode === 'JS_RUNTIME' ? 'Event Loop' : 'DSA'}
        </span>
        <span className="text-[#555] ml-1">({confidencePercent}%)</span>
      </div>

      {/* Algorithm type badge (DSA mode only) */}
      {!isJSRuntime && algorithmType && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 rounded"
        >
          {getAlgorithmLabel()}
        </motion.div>
      )}
    </div>
  )
}
