'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'
import type { VariableState } from '@/engine/simulator'

/**
 * VariablesPanel - Shows current variable values for DSA visualization
 *
 * Features:
 * - Current variable values
 * - Change indicators (highlight when updated)
 * - Previous value display for changed variables
 * - Type indicators
 */
export function VariablesPanel() {
  const variables = useExecutionStore((s) => s.variables)
  const executionMode = useExecutionStore((s) => s.executionMode)

  // Only show in DSA mode
  if (executionMode !== 'DSA') {
    return null
  }

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
          <span>VARIABLES</span>
        </div>
        <span className="text-xs font-normal normal-case text-[#666]">
          {variables.length} {variables.length === 1 ? 'VAR' : 'VARS'}
        </span>
      </div>

      <div className="panel-content flex-1 overflow-auto">
        {variables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-2xl text-[#333] mb-1">x</div>
            <span className="text-xs text-[#666]">No variables tracked</span>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {variables.map((variable) => (
                <VariableItem key={variable.name} variable={variable} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

interface VariableItemProps {
  variable: VariableState
}

function VariableItem({ variable }: VariableItemProps) {
  const { name, value, type, changed, previousValue } = variable

  // Format value for display
  const formatValue = (val: unknown): string => {
    if (val === null) return 'null'
    if (val === undefined) return 'undefined'
    if (typeof val === 'string') return `"${val}"`
    if (Array.isArray(val)) return `[${val.join(', ')}]`
    if (typeof val === 'object') return JSON.stringify(val)
    return String(val)
  }

  // Get type color
  const getTypeColor = (): string => {
    switch (type) {
      case 'number':
        return 'text-blue-400 bg-blue-500/20'
      case 'string':
        return 'text-green-400 bg-green-500/20'
      case 'boolean':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'array':
        return 'text-purple-400 bg-purple-500/20'
      case 'object':
        return 'text-orange-400 bg-orange-500/20'
      case 'null':
      case 'undefined':
        return 'text-gray-400 bg-gray-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
        boxShadow: changed
          ? [
              '0 0 0 2px rgba(6, 182, 212, 0.5)',
              '0 0 20px 4px rgba(6, 182, 212, 0.3)',
              '0 0 0 2px rgba(6, 182, 212, 0)',
            ]
          : 'none',
      }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        boxShadow: { duration: 0.6, times: [0, 0.3, 1] },
      }}
      className={`
        rounded-lg border-2 p-3 transition-all relative
        ${changed ? 'bg-cyan-500/20 border-cyan-500' : 'bg-[#1a1a1a] border-[#333]'}
      `}
    >
      {/* Changed badge */}
      {changed && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-cyan-500 text-[10px] font-bold text-black rounded"
        >
          CHANGED
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Variable name */}
          <span className="font-mono font-medium text-white">{name}</span>

          {/* Type badge */}
          <span className={`px-1.5 py-0.5 text-[10px] rounded ${getTypeColor()}`}>{type}</span>
        </div>

        {/* Value */}
        <span className="font-mono text-sm text-cyan-400">{formatValue(value)}</span>
      </div>

      {/* Previous value (if changed) */}
      {changed && previousValue !== undefined && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-xs text-[#666] mt-1 font-mono"
        >
          was: {formatValue(previousValue)}
        </motion.div>
      )}
    </motion.div>
  )
}
