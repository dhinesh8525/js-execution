'use client'

import { motion } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'

/**
 * AlgorithmMetricsPanel - Shows algorithm performance metrics
 *
 * Features:
 * - Comparison count
 * - Swap count
 * - Recursion depth
 * - Algorithm type indicator
 */
export function AlgorithmMetricsPanel() {
  const totalComparisons = useExecutionStore((s) => s.totalComparisons)
  const totalSwaps = useExecutionStore((s) => s.totalSwaps)
  const maxRecursionDepth = useExecutionStore((s) => s.maxRecursionDepth)
  const algorithmType = useExecutionStore((s) => s.algorithmType)
  const executionMode = useExecutionStore((s) => s.executionMode)

  // Only show in DSA mode
  if (executionMode !== 'DSA') {
    return null
  }

  // Get algorithm type display info
  const getAlgorithmInfo = () => {
    switch (algorithmType) {
      case 'SORTING':
        return { label: 'Sorting', color: 'text-orange-400 bg-orange-500/20' }
      case 'SEARCHING':
        return { label: 'Searching', color: 'text-blue-400 bg-blue-500/20' }
      case 'TREE_TRAVERSAL':
        return { label: 'Tree', color: 'text-green-400 bg-green-500/20' }
      case 'GRAPH_TRAVERSAL':
        return { label: 'Graph', color: 'text-purple-400 bg-purple-500/20' }
      case 'RECURSION':
        return { label: 'Recursion', color: 'text-cyan-400 bg-cyan-500/20' }
      case 'DYNAMIC_PROGRAMMING':
        return { label: 'DP', color: 'text-yellow-400 bg-yellow-500/20' }
      case 'LINKED_LIST':
        return { label: 'Linked List', color: 'text-pink-400 bg-pink-500/20' }
      case 'STACK_QUEUE':
        return { label: 'Stack/Queue', color: 'text-indigo-400 bg-indigo-500/20' }
      default:
        return { label: 'Generic', color: 'text-gray-400 bg-gray-500/20' }
    }
  }

  const algInfo = getAlgorithmInfo()

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M7 12l4-4 4 4 4-4" />
          </svg>
          <span>METRICS</span>
        </div>
        <span className={`px-1.5 py-0.5 text-[10px] rounded ${algInfo.color}`}>
          {algInfo.label}
        </span>
      </div>

      <div className="panel-content flex-1">
        <div className="grid grid-cols-3 gap-2 h-full">
          {/* Comparisons */}
          <MetricCard
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 12h8M12 8v8" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            }
            label="Comparisons"
            value={totalComparisons}
            color="text-yellow-400"
          />

          {/* Swaps */}
          <MetricCard
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 16l-4-4 4-4M17 8l4 4-4 4M3 12h18" />
              </svg>
            }
            label="Swaps"
            value={totalSwaps}
            color="text-red-400"
          />

          {/* Recursion Depth */}
          <MetricCard
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v16M8 4v16M12 4v16M16 4v16M20 4v16" />
              </svg>
            }
            label="Max Depth"
            value={maxRecursionDepth}
            color="text-cyan-400"
          />
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}

function MetricCard({ icon, label, value, color }: MetricCardProps) {
  return (
    <motion.div
      className="bg-[#1a1a1a] rounded-lg border border-[#333] p-3 flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className={`${color} mb-1`}>{icon}</div>
      <motion.div
        key={value}
        className={`text-2xl font-bold ${color}`}
        initial={{ scale: 1.2, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {value}
      </motion.div>
      <div className="text-[10px] text-[#666] uppercase tracking-wide">{label}</div>
    </motion.div>
  )
}
