'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'
import { useMemo } from 'react'

/**
 * ArrayVisualizerPanel - Visualizes array state for DSA algorithms
 *
 * Features:
 * - Bar chart representation with height proportional to value
 * - Color coding: comparing (yellow), swapping (red), sorted (green), accessing (blue)
 * - Pointer indicators (i, j, left, right, mid, etc.)
 * - Smooth swap animations
 */
export function ArrayVisualizerPanel() {
  const arrays = useExecutionStore((s) => s.arrays)
  const executionMode = useExecutionStore((s) => s.executionMode)

  // Only show in DSA mode
  if (executionMode !== 'DSA' || arrays.length === 0) {
    return (
      <div className="panel h-full flex flex-col">
        <div className="panel-header justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 3v18" />
            </svg>
            <span>ARRAY</span>
          </div>
        </div>
        <div className="panel-content flex-1 flex items-center justify-center">
          <div className="text-[#666] text-sm text-center">
            <div className="text-2xl mb-1">[ ]</div>
            <span>No array data</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 3v18" />
          </svg>
          <span>ARRAY</span>
        </div>
        <span className="text-xs font-normal normal-case text-[#666]">
          {arrays.length} {arrays.length === 1 ? 'ARRAY' : 'ARRAYS'}
        </span>
      </div>

      <div className="panel-content flex-1 overflow-auto">
        <div className="space-y-4">
          {arrays.map((arr) => (
            <ArrayVisualization key={arr.id} array={arr} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ArrayVisualizationProps {
  array: {
    id: string
    name: string
    values: (number | string | null)[]
    comparing: number[]
    swapping: number[]
    sorted: number[]
    accessing: number[]
    pointers: Record<string, number>
  }
}

function ArrayVisualization({ array }: ArrayVisualizationProps) {
  const { name, values, comparing, swapping, sorted, accessing, pointers } = array

  // Calculate max value for scaling bars
  const maxValue = useMemo(() => {
    const numericValues = values.filter((v): v is number => typeof v === 'number')
    return Math.max(...numericValues, 1)
  }, [values])

  // Determine bar color based on state
  const getBarColor = (index: number): string => {
    if (swapping.includes(index)) return 'bg-red-500 shadow-red-500/30'
    if (comparing.includes(index)) return 'bg-yellow-500 shadow-yellow-500/30'
    if (sorted.includes(index)) return 'bg-green-500 shadow-green-500/30'
    if (accessing.includes(index)) return 'bg-blue-500 shadow-blue-500/30'
    return 'bg-[#444]'
  }

  // Get pointer labels for an index
  const getPointerLabels = (index: number): string[] => {
    const labels: string[] = []
    for (const [label, pointerIndex] of Object.entries(pointers)) {
      if (pointerIndex === index) {
        labels.push(label)
      }
    }
    return labels
  }

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#333]">
      {/* Array name */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white">{name}</span>
        <span className="text-xs text-[#666]">{values.length} elements</span>
      </div>

      {/* Bar chart visualization */}
      <div className="flex items-end gap-1 h-24 mb-2">
        <AnimatePresence mode="popLayout">
          {values.map((value, index) => {
            const numValue = typeof value === 'number' ? value : 0
            const height = Math.max((numValue / maxValue) * 100, 10)
            const pointerLabels = getPointerLabels(index)
            const isHighlighted = swapping.includes(index) || comparing.includes(index) || accessing.includes(index)

            return (
              <motion.div
                key={`${index}-${value}`}
                className="relative flex flex-col items-center"
                style={{ flex: 1 }}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
              >
                {/* Pointer labels above bar */}
                {pointerLabels.length > 0 && (
                  <motion.div
                    className="absolute -top-5 flex gap-0.5"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {pointerLabels.map((label) => (
                      <span
                        key={label}
                        className="px-1 py-0.5 text-[8px] font-bold bg-cyan-500 text-black rounded"
                      >
                        {label}
                      </span>
                    ))}
                  </motion.div>
                )}

                {/* Bar */}
                <motion.div
                  className={`
                    w-full rounded-t cursor-default transition-colors
                    ${getBarColor(index)}
                    ${isHighlighted ? 'shadow-lg' : ''}
                  `}
                  initial={{ height: 0 }}
                  animate={{
                    height: `${height}%`,
                    scale: isHighlighted ? 1.05 : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                />

                {/* Value label */}
                <span className="text-[10px] text-[#888] mt-1 truncate max-w-full">
                  {value ?? '—'}
                </span>

                {/* Index label */}
                <span className="text-[8px] text-[#555]">{index}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-2 text-[10px]">
        <LegendItem color="bg-yellow-500" label="Comparing" />
        <LegendItem color="bg-red-500" label="Swapping" />
        <LegendItem color="bg-green-500" label="Sorted" />
        <LegendItem color="bg-blue-500" label="Accessing" />
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded ${color}`} />
      <span className="text-[#888]">{label}</span>
    </div>
  )
}
