'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore, type EventLoopPhase } from '@/stores/executionStore'

interface ExecutionReason {
  primary: string
  details: string[]
  type: 'sync' | 'microtask' | 'macrotask' | 'idle'
}

/**
 * Generate an explanation for why the current step is executing
 */
function generateExplanation(
  phase: EventLoopPhase,
  stepType: string,
  description: string,
  scheduledFromLine: number | null,
  callStackLength: number,
  microtaskCount: number,
  macrotaskCount: number
): ExecutionReason {
  // Synchronous execution
  if (phase === 'sync') {
    return {
      primary: 'Executing synchronous code',
      details: [
        'JavaScript is single-threaded and runs synchronous code first',
        callStackLength > 1
          ? `Call stack has ${callStackLength} frames`
          : 'Executing in global context',
        microtaskCount > 0
          ? `${microtaskCount} microtask${microtaskCount > 1 ? 's' : ''} waiting (will run after sync completes)`
          : 'No microtasks scheduled yet',
      ],
      type: 'sync',
    }
  }

  // Microtask execution
  if (phase === 'microtask') {
    const details = [
      'All synchronous code has finished (call stack was empty)',
      'Microtasks have higher priority than macrotasks',
      'The ENTIRE microtask queue drains before ANY macrotask runs',
    ]

    if (microtaskCount > 0) {
      details.push(`${microtaskCount} more microtask${microtaskCount > 1 ? 's' : ''} remaining in queue`)
    }

    if (macrotaskCount > 0) {
      details.push(`${macrotaskCount} macrotask${macrotaskCount > 1 ? 's' : ''} waiting (will run after all microtasks)`)
    }

    if (scheduledFromLine) {
      details.push(`This callback was scheduled from line ${scheduledFromLine}`)
    }

    return {
      primary: 'Draining microtask queue',
      details,
      type: 'microtask',
    }
  }

  // Macrotask execution
  if (phase === 'macrotask') {
    const details = [
      'Microtask queue is empty',
      'One macrotask runs per event loop iteration',
      'After this macrotask, microtasks will be checked again',
    ]

    if (macrotaskCount > 0) {
      details.push(`${macrotaskCount} more macrotask${macrotaskCount > 1 ? 's' : ''} waiting`)
    }

    if (scheduledFromLine) {
      details.push(`This callback was scheduled from line ${scheduledFromLine}`)
    }

    return {
      primary: 'Executing one macrotask',
      details,
      type: 'macrotask',
    }
  }

  // Idle state
  return {
    primary: 'Event loop idle',
    details: [
      'All queues are empty',
      'No more code to execute',
      'Execution is complete',
    ],
    type: 'idle',
  }
}

/**
 * Get color based on execution type
 */
function getTypeColor(type: ExecutionReason['type']): string {
  switch (type) {
    case 'sync':
      return '#3b82f6' // blue
    case 'microtask':
      return '#a855f7' // purple
    case 'macrotask':
      return '#22c55e' // green
    case 'idle':
      return '#6b7280' // gray
  }
}

export function ExplanationPanel() {
  const currentPhase = useExecutionStore((s) => s.currentPhase)
  const currentDescription = useExecutionStore((s) => s.currentDescription)
  const currentExplanation = useExecutionStore((s) => s.currentExplanation)
  const scheduledFromLine = useExecutionStore((s) => s.scheduledFromLine)
  const callStack = useExecutionStore((s) => s.callStack)
  const microtaskQueue = useExecutionStore((s) => s.microtaskQueue)
  const macrotaskQueue = useExecutionStore((s) => s.macrotaskQueue)
  const currentStep = useExecutionStore((s) => s.currentStep)
  const steps = useExecutionStore((s) => s.steps)

  const stepType = steps[currentStep]?.type || ''

  const explanation = useMemo(
    () =>
      generateExplanation(
        currentPhase,
        stepType,
        currentDescription,
        scheduledFromLine,
        callStack.length,
        microtaskQueue.length,
        macrotaskQueue.length
      ),
    [currentPhase, stepType, currentDescription, scheduledFromLine, callStack.length, microtaskQueue.length, macrotaskQueue.length]
  )

  const typeColor = getTypeColor(explanation.type)

  if (currentStep < 0) {
    return (
      <div className="panel h-full flex flex-col">
        <div className="panel-header">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span>WHY IS THIS EXECUTING?</span>
        </div>
        <div className="panel-content flex-1 flex items-center justify-center">
          <div className="text-center text-[#666]">
            <div className="text-2xl mb-2">💡</div>
            <div className="text-sm">Run code and step through to see explanations</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <span>WHY IS THIS EXECUTING?</span>
      </div>

      <div className="panel-content flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Current Step Description */}
            <div className="p-3 rounded-lg bg-[#252525] border border-[#333]">
              <div className="text-xs text-[#666] mb-1 uppercase tracking-wider">Current Step</div>
              <div className="text-white font-medium">{currentDescription}</div>
            </div>

            {/* Primary Reason */}
            <div
              className="p-3 rounded-lg border-2"
              style={{
                borderColor: typeColor,
                backgroundColor: `${typeColor}20`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: typeColor }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="font-semibold" style={{ color: typeColor }}>
                  {explanation.primary}
                </span>
                <span
                  className="px-1.5 py-0.5 text-[10px] font-bold rounded uppercase"
                  style={{ backgroundColor: typeColor, color: 'black' }}
                >
                  {explanation.type}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <div className="text-xs text-[#666] uppercase tracking-wider">Details</div>
              {explanation.details.map((detail, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 text-sm text-[#888]"
                >
                  <span className="text-[#666] mt-0.5">•</span>
                  <span>{detail}</span>
                </motion.div>
              ))}
            </div>

            {/* Engine Explanation (if available) */}
            {currentExplanation && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="text-xs text-blue-400 mb-1 uppercase tracking-wider">Technical Detail</div>
                <div className="text-sm text-blue-200">{currentExplanation}</div>
              </div>
            )}

            {/* Scheduling Origin */}
            {scheduledFromLine && (
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="text-xs text-orange-400 mb-1 uppercase tracking-wider">Scheduled From</div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-200">Line {scheduledFromLine}</span>
                  <span className="text-[10px] text-orange-400/70">
                    (this callback was registered earlier in execution)
                  </span>
                </div>
              </div>
            )}

            {/* State Summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-[#252525]">
                <div className="text-lg font-bold text-blue-400">{callStack.length}</div>
                <div className="text-[10px] text-[#666]">Call Stack</div>
              </div>
              <div className="p-2 rounded-lg bg-[#252525]">
                <div className="text-lg font-bold text-purple-400">{microtaskQueue.length}</div>
                <div className="text-[10px] text-[#666]">Microtasks</div>
              </div>
              <div className="p-2 rounded-lg bg-[#252525]">
                <div className="text-lg font-bold text-green-400">{macrotaskQueue.length}</div>
                <div className="text-[10px] text-[#666]">Macrotasks</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ExplanationPanel
