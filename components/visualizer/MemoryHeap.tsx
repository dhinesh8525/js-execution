'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { HeapObject, SerializedValue } from '@/types/execution'
import { formatValue, getValueColor } from '@/lib/utils'

interface MemoryHeapProps {
  heap: Map<string, HeapObject>
  highlightedIds?: string[]
}

export function MemoryHeap({ heap, highlightedIds = [] }: MemoryHeapProps) {
  const objects = Array.from(heap.values())

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header flex items-center justify-between">
        <span>Heap</span>
        <span className="text-xs text-gray-500">{objects.length} objects</span>
      </div>

      <div className="panel-content flex-1 overflow-auto">
        {objects.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No heap objects
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {objects.map((obj) => (
                <motion.div
                  key={obj.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <HeapObjectCard
                    object={obj}
                    isHighlighted={highlightedIds.includes(obj.id)}
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

interface HeapObjectCardProps {
  object: HeapObject
  isHighlighted: boolean
}

function HeapObjectCard({ object, isHighlighted }: HeapObjectCardProps) {
  const properties = Object.entries(object.properties)

  return (
    <div
      className={`heap-object ${isHighlighted ? 'ring-2 ring-accent-green' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-accent-green">
          {object.type === 'array' ? 'Array' : 'Object'}
        </span>
        <span className="text-xs text-gray-500 font-mono">@{object.id.slice(0, 6)}</span>
      </div>

      {properties.length === 0 ? (
        <div className="text-xs text-gray-500">Empty {object.type}</div>
      ) : (
        <div className="space-y-1">
          {properties.slice(0, 8).map(([key, value]) => (
            <PropertyRow key={key} name={key} value={value} />
          ))}
          {properties.length > 8 && (
            <div className="text-xs text-gray-500">
              ... {properties.length - 8} more properties
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface PropertyRowProps {
  name: string
  value: SerializedValue
}

function PropertyRow({ name, value }: PropertyRowProps) {
  const colorClass = getValueColor(value.type)
  const isReference = value.type === 'object' || value.type === 'array'

  return (
    <div className="flex items-center text-xs font-mono">
      <span className="text-gray-400 mr-2">{name}:</span>
      {isReference ? (
        <span className="text-accent-blue flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {value.preview}
        </span>
      ) : (
        <span className={colorClass}>{formatValue(value)}</span>
      )}
    </div>
  )
}
