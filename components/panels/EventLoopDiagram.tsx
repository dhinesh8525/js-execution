'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'
import { useEffect, useState } from 'react'

export function EventLoopDiagram() {
  const currentPhase = useExecutionStore((s) => s.currentPhase)
  const currentDescription = useExecutionStore((s) => s.currentDescription)
  const callStack = useExecutionStore((s) => s.callStack)
  const webApiTimers = useExecutionStore((s) => s.webApiTimers)
  const macrotaskQueue = useExecutionStore((s) => s.macrotaskQueue)
  const microtaskQueue = useExecutionStore((s) => s.microtaskQueue)
  const currentStep = useExecutionStore((s) => s.currentStep)
  const [animatingItem, setAnimatingItem] = useState<string | null>(null)

  // Determine active node based on phase
  type ActiveNodeType = 'cs' | 'api' | 'micro' | 'task' | 'idle'
  const activeNode: ActiveNodeType =
    currentPhase === 'sync' && callStack.length > 0
      ? 'cs'
      : currentPhase === 'sync' && webApiTimers.length > 0
        ? 'api'
        : currentPhase === 'microtask'
          ? 'micro'
          : currentPhase === 'macrotask'
            ? 'task'
            : 'idle'

  // Animate flow on step change
  useEffect(() => {
    if (currentStep >= 0) {
      setAnimatingItem(activeNode)
      const timer = setTimeout(() => setAnimatingItem(null), 500)
      return () => clearTimeout(timer)
    }
  }, [currentStep, activeNode])

  return (
    <div className="panel flex-1 flex flex-col">
      <div className="panel-header">
        <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>EVENT LOOP</span>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        {/* Main Circular Diagram */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className="relative w-56 h-56">
            {/* Background circle with dashed line */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 224 224">
              {/* Outer track */}
              <circle cx="112" cy="112" r="90" fill="none" stroke="#252525" strokeWidth="3" />
              {/* Animated progress arc */}
              <motion.circle
                cx="112"
                cy="112"
                r="90"
                fill="none"
                stroke="url(#loopGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="565"
                initial={{ strokeDashoffset: 565 }}
                animate={{
                  strokeDashoffset:
                    activeNode === 'idle'
                      ? 565
                      : activeNode === 'cs'
                        ? 424
                        : activeNode === 'api'
                          ? 282
                          : activeNode === 'task'
                            ? 141
                            : 0,
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
              {/* Connecting arrows */}
              <defs>
                <linearGradient id="loopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#444" />
                </marker>
              </defs>
            </svg>

            {/* Call Stack Node - Top */}
            <EventLoopNode
              label="Call Stack"
              shortLabel="CS"
              position="top"
              color="blue"
              isActive={activeNode === 'cs'}
              isAnimating={animatingItem === 'cs'}
              count={callStack.length}
            />

            {/* Web APIs Node - Right */}
            <EventLoopNode
              label="Web APIs"
              shortLabel="API"
              position="right"
              color="orange"
              isActive={activeNode === 'api'}
              isAnimating={animatingItem === 'api'}
              count={webApiTimers.length}
            />

            {/* Task Queue Node - Bottom */}
            <EventLoopNode
              label="Task Queue"
              shortLabel="TQ"
              position="bottom"
              color="green"
              isActive={activeNode === 'task'}
              isAnimating={animatingItem === 'task'}
              count={macrotaskQueue.length}
            />

            {/* Microtask Queue Node - Left */}
            <EventLoopNode
              label="Microtasks"
              shortLabel="μT"
              position="left"
              color="purple"
              isActive={activeNode === 'micro'}
              isAnimating={animatingItem === 'micro'}
              count={microtaskQueue.length}
            />

            {/* Center Status */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="text-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-2xl mb-1">
                  {activeNode === 'idle'
                    ? '⏸'
                    : activeNode === 'cs'
                      ? '⚡'
                      : activeNode === 'micro'
                        ? '🔄'
                        : activeNode === 'api'
                          ? '⏱'
                          : '📥'}
                </div>
                <div className="text-xs text-[#666] font-medium uppercase tracking-wider">
                  {activeNode === 'idle'
                    ? 'Idle'
                    : activeNode === 'cs'
                      ? 'Executing'
                      : activeNode === 'micro'
                        ? 'Microtasks'
                        : activeNode === 'api'
                          ? 'Waiting'
                          : 'Tasks'}
                </div>
              </motion.div>
            </div>

            {/* Animated particle moving around the loop */}
            <AnimatePresence>
              {activeNode !== 'idle' && (
                <motion.div
                  className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    rotate: [0, 360],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                  }}
                  style={{
                    top: '50%',
                    left: '50%',
                    marginTop: -6,
                    marginLeft: -6,
                    transformOrigin: '6px 96px',
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Flow Description */}
        <div className="mt-4 p-3 rounded-lg bg-[#1a1a1a] border border-[#333]">
          <div className="text-xs text-[#666] mb-2 uppercase tracking-wider font-medium">Current Phase</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDescription}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-white"
            >
              {currentDescription || <span className="text-[#666]">Event loop is idle, waiting for tasks...</span>}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <LegendItem color="blue" label="Call Stack" desc="Sync code" />
          <LegendItem color="purple" label="Microtasks" desc="Promises" />
          <LegendItem color="green" label="Task Queue" desc="Timers" />
          <LegendItem color="orange" label="Web APIs" desc="Browser" />
        </div>
      </div>
    </div>
  )
}

interface EventLoopNodeProps {
  label: string
  shortLabel: string
  position: 'top' | 'right' | 'bottom' | 'left'
  color: 'blue' | 'green' | 'purple' | 'orange'
  isActive: boolean
  isAnimating: boolean
  count: number
}

function EventLoopNode({ label, shortLabel, position, color, isActive, isAnimating, count }: EventLoopNodeProps) {
  const colorMap = {
    blue: { bg: '#3b82f6', shadow: 'rgba(59, 130, 246, 0.5)', border: '#3b82f6' },
    green: { bg: '#22c55e', shadow: 'rgba(34, 197, 94, 0.5)', border: '#22c55e' },
    purple: { bg: '#a855f7', shadow: 'rgba(168, 85, 247, 0.5)', border: '#a855f7' },
    orange: { bg: '#f97316', shadow: 'rgba(249, 115, 22, 0.5)', border: '#f97316' },
  }

  const positionStyles = {
    top: { top: '-12px', left: '50%', transform: 'translateX(-50%)' },
    right: { top: '50%', right: '-12px', transform: 'translateY(-50%)' },
    bottom: { bottom: '-12px', left: '50%', transform: 'translateX(-50%)' },
    left: { top: '50%', left: '-12px', transform: 'translateY(-50%)' },
  }

  const colors = colorMap[color]

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={positionStyles[position] as React.CSSProperties}
      animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 font-bold text-white relative overflow-hidden"
        style={{
          backgroundColor: isActive ? colors.bg : '#252525',
          borderColor: colors.border,
          boxShadow: isActive ? `0 0 20px ${colors.shadow}` : 'none',
        }}
        animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
      >
        <span className="text-sm">{shortLabel}</span>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center"
          >
            {count}
          </motion.span>
        )}
      </motion.div>
      <span className="text-[10px] text-[#666] mt-1 whitespace-nowrap">{label}</span>
    </motion.div>
  )
}

function LegendItem({ color, label, desc }: { color: string; label: string; desc: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2.5 h-2.5 rounded-full ${colorMap[color]}`} />
      <span className="text-white">{label}</span>
      <span className="text-[#666]">({desc})</span>
    </div>
  )
}
