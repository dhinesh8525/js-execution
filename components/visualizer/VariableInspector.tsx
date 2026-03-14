'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SerializedValue } from '@/types/execution'
import { formatValue, getValueColor } from '@/lib/utils'

interface VariableInspectorProps {
  name: string
  value: SerializedValue
  onClose?: () => void
}

export function VariableInspector({ name, value, onClose }: VariableInspectorProps) {
  const [expanded, setExpanded] = useState(true)

  const colorClass = getValueColor(value.type)
  const hasProperties = value.properties && Object.keys(value.properties).length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-panel-bg border border-panel-border rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-editor-bg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-white"
          >
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="font-mono text-sm text-white">{name}</span>
          <span className="text-xs text-gray-500">{value.type}</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3">
              {/* Simple value */}
              {!hasProperties && (
                <div className={`font-mono text-sm ${colorClass}`}>
                  {formatValue(value)}
                </div>
              )}

              {/* Object/Array with properties */}
              {hasProperties && (
                <div className="space-y-1">
                  {Object.entries(value.properties!).map(([key, propValue]) => (
                    <PropertyRow key={key} name={key} value={propValue} depth={0} />
                  ))}
                </div>
              )}

              {/* Additional metadata */}
              <div className="mt-3 pt-3 border-t border-panel-border">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Type: </span>
                    <span className="text-white">{value.type}</span>
                  </div>
                  {value.length !== undefined && (
                    <div>
                      <span className="text-gray-500">Length: </span>
                      <span className="text-white">{value.length}</span>
                    </div>
                  )}
                  {value.heapId && (
                    <div>
                      <span className="text-gray-500">Heap ID: </span>
                      <span className="text-accent-blue font-mono">@{value.heapId.slice(0, 8)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface PropertyRowProps {
  name: string
  value: SerializedValue
  depth: number
}

function PropertyRow({ name, value, depth }: PropertyRowProps) {
  const [expanded, setExpanded] = useState(depth < 1)
  const colorClass = getValueColor(value.type)
  const hasNestedProperties = value.properties && Object.keys(value.properties).length > 0

  return (
    <div style={{ paddingLeft: `${depth * 12}px` }}>
      <div className="flex items-center gap-2 py-0.5">
        {hasNestedProperties ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-white"
          >
            <svg
              className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="w-3" />
        )}
        <span className="text-gray-400 text-xs font-mono">{name}:</span>
        <span className={`text-xs font-mono ${colorClass}`}>
          {formatValue(value)}
        </span>
      </div>

      {expanded && hasNestedProperties && (
        <div className="ml-2">
          {Object.entries(value.properties!).map(([key, propValue]) => (
            <PropertyRow key={key} name={key} value={propValue} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
