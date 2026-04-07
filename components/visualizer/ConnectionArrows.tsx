'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore, type VisualConnection } from '@/stores/executionStore'

interface ConnectionPoint {
  x: number
  y: number
  component: string
  itemId: string
}

interface ArrowPath {
  id: string
  path: string
  color: string
  label?: string
  isActive: boolean
}

// Component IDs to DOM element ID mapping
const COMPONENT_REFS: Record<string, string> = {
  code: 'code-panel',
  callstack: 'callstack-panel',
  webapi: 'webapi-panel',
  microtask: 'microtask-panel',
  macrotask: 'macrotask-panel',
}

// Colors for different connection types
const CONNECTION_COLORS: Record<string, string> = {
  schedule: '#3b82f6', // blue - scheduling a task
  execute: '#22c55e', // green - executing a task
  complete: '#f97316', // orange - timer completing
  move: '#a855f7', // purple - moving between queues
}

/**
 * ConnectionArrows renders SVG arrows showing the flow of tasks
 * between different components of the event loop visualization.
 */
export function ConnectionArrows() {
  const connections = useExecutionStore((s) => s.connections)
  const [arrows, setArrows] = useState<ArrowPath[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!connections || connections.length === 0) {
      setArrows([])
      return
    }

    // Small delay to ensure DOM elements are rendered
    const timeoutId = setTimeout(() => {
      const newArrows = connections
        .map((conn) => calculateArrowPath(conn, containerRef.current))
        .filter((arrow): arrow is ArrowPath => arrow !== null)

      setArrows(newArrows)
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [connections])

  if (arrows.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ overflow: 'visible' }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Arrow markers for each color */}
          {Object.entries(CONNECTION_COLORS).map(([type, color]) => (
            <marker
              key={type}
              id={`arrowhead-${type}`}
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={color} />
            </marker>
          ))}
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <AnimatePresence>
          {arrows.map((arrow) => (
            <motion.g key={arrow.id}>
              {/* Background path (glow) */}
              <motion.path
                d={arrow.path}
                fill="none"
                stroke={arrow.color}
                strokeWidth={4}
                strokeOpacity={0.3}
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              {/* Main path */}
              <motion.path
                d={arrow.path}
                fill="none"
                stroke={arrow.color}
                strokeWidth={2}
                strokeLinecap="round"
                markerEnd={`url(#arrowhead-${getConnectionType(arrow.color)})`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
              {/* Label */}
              {arrow.label && (
                <motion.text
                  x={getPathMidpoint(arrow.path).x}
                  y={getPathMidpoint(arrow.path).y - 8}
                  fill={arrow.color}
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {arrow.label}
                </motion.text>
              )}
            </motion.g>
          ))}
        </AnimatePresence>
      </svg>
    </div>
  )
}

/**
 * Calculate the SVG path for a connection arrow
 */
function calculateArrowPath(
  connection: VisualConnection,
  container: HTMLElement | null
): ArrowPath | null {
  if (!container) return null

  const sourcePoint = getElementCenter(
    connection.sourceComponent,
    connection.sourceItemId,
    'source'
  )
  const targetPoint = getElementCenter(
    connection.targetComponent,
    connection.targetItemId,
    'target'
  )

  if (!sourcePoint || !targetPoint) return null

  // Create a curved path between points
  const path = createCurvedPath(sourcePoint, targetPoint)
  const color = CONNECTION_COLORS[connection.connectionType] || CONNECTION_COLORS.schedule

  return {
    id: connection.id,
    path,
    color,
    label: connection.label,
    isActive: connection.isActive,
  }
}

/**
 * Get the center position of an element
 */
function getElementCenter(
  component: string,
  itemId: string,
  position: 'source' | 'target'
): ConnectionPoint | null {
  // Try to find specific item element first
  let element = document.querySelector(`[data-connection-id="${itemId}"]`)

  // Fall back to panel element
  if (!element) {
    const panelId = COMPONENT_REFS[component]
    element = document.getElementById(panelId)
  }

  if (!element) return null

  const rect = element.getBoundingClientRect()

  // Adjust position based on source/target
  let x = rect.left + rect.width / 2
  let y = rect.top + rect.height / 2

  // For code panel, align to right edge
  if (component === 'code') {
    x = rect.right - 10
  }
  // For queue panels, align to left edge for source, right for target
  else if (component === 'microtask' || component === 'macrotask') {
    x = position === 'source' ? rect.left + 10 : rect.right - 10
  }
  // For callstack, align to left edge
  else if (component === 'callstack') {
    x = rect.left + 10
  }
  // For webapi, center
  else if (component === 'webapi') {
    x = position === 'source' ? rect.right - 10 : rect.left + 10
  }

  return { x, y, component, itemId }
}

/**
 * Create a curved bezier path between two points
 */
function createCurvedPath(source: ConnectionPoint, target: ConnectionPoint): string {
  const dx = target.x - source.x
  const dy = target.y - source.y

  // Calculate control points for smooth curve
  const midX = (source.x + target.x) / 2
  const midY = (source.y + target.y) / 2

  // Adjust curve based on direction
  let cp1x, cp1y, cp2x, cp2y

  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal movement - curve vertically
    cp1x = midX
    cp1y = source.y
    cp2x = midX
    cp2y = target.y
  } else {
    // Vertical movement - curve horizontally
    cp1x = source.x
    cp1y = midY
    cp2x = target.x
    cp2y = midY
  }

  return `M ${source.x} ${source.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${target.x} ${target.y}`
}

/**
 * Get the midpoint of a path for label positioning
 */
function getPathMidpoint(pathData: string): { x: number; y: number } {
  // Parse the path to extract coordinates
  const match = pathData.match(/M ([\d.]+) ([\d.]+) C ([\d.]+) ([\d.]+), ([\d.]+) ([\d.]+), ([\d.]+) ([\d.]+)/)
  if (!match) return { x: 0, y: 0 }

  const [, sx, sy, , , , , ex, ey] = match.map(Number)
  return {
    x: (sx + ex) / 2,
    y: (sy + ey) / 2,
  }
}

/**
 * Get connection type from color for marker reference
 */
function getConnectionType(color: string): string {
  for (const [type, c] of Object.entries(CONNECTION_COLORS)) {
    if (c === color) return type
  }
  return 'schedule'
}

export default ConnectionArrows
