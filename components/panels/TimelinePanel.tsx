'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'
import {
  generateTimeline,
  getPhaseColor,
  getPhaseBgColor,
  type TimelineEvent,
} from '@/engine/simulator'

export function TimelinePanel() {
  const steps = useExecutionStore((s) => s.steps)
  const currentStep = useExecutionStore((s) => s.currentStep)
  const goToStep = useExecutionStore((s) => s.goToStep)

  // Generate timeline events from steps
  const timeline = useMemo(() => generateTimeline(steps), [steps])

  // Calculate total width for proportional sizing
  const totalSteps = steps.length || 1

  // Find which timeline event the current step is in
  const currentEvent = useMemo(() => {
    return timeline.find((e) => currentStep >= e.startStep && currentStep <= e.endStep)
  }, [timeline, currentStep])

  if (steps.length === 0) {
    return (
      <div className="panel h-full flex flex-col">
        <div className="panel-header">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span>EXECUTION TIMELINE</span>
        </div>
        <div className="panel-content flex-1 flex items-center justify-center">
          <div className="text-center text-[#666]">
            <div className="text-2xl mb-2">⏱️</div>
            <div className="text-sm">Run code to see timeline</div>
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
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span>EXECUTION TIMELINE</span>
        </div>
        <span className="text-xs font-normal normal-case text-[#666]">
          {timeline.length} phase{timeline.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="panel-content flex-1 overflow-hidden flex flex-col">
        {/* Horizontal Timeline Bar */}
        <div className="relative h-12 mb-4 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#333]">
          <div className="absolute inset-0 flex">
            {timeline.map((event, index) => {
              const width = ((event.duration / totalSteps) * 100)
              const isActive = currentEvent?.id === event.id
              const isPast = currentStep > event.endStep

              return (
                <motion.button
                  key={event.id}
                  onClick={() => goToStep(event.startStep)}
                  className="relative h-full flex items-center justify-center overflow-hidden transition-all"
                  style={{
                    width: `${width}%`,
                    backgroundColor: getPhaseBgColor(event.phase),
                    borderRight: index < timeline.length - 1 ? '1px solid #333' : 'none',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="timeline-active"
                      className="absolute inset-0"
                      style={{ backgroundColor: getPhaseColor(event.phase) }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Past indicator */}
                  {isPast && (
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{ backgroundColor: getPhaseColor(event.phase) }}
                    />
                  )}

                  {/* Label (show only if wide enough) */}
                  {width > 10 && (
                    <span
                      className="relative z-10 text-[10px] font-medium truncate px-1"
                      style={{ color: getPhaseColor(event.phase) }}
                    >
                      {event.label}
                    </span>
                  )}

                  {/* Current step marker */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 rounded-t"
                      style={{
                        width: `${((currentStep - event.startStep) / event.duration) * 100}%`,
                        backgroundColor: getPhaseColor(event.phase),
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep - event.startStep + 1) / event.duration) * 100}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Phase Legend */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getPhaseColor('sync') }} />
            <span className="text-[10px] text-[#888]">Sync</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getPhaseColor('microtask-drain') }} />
            <span className="text-[10px] text-[#888]">Microtasks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: getPhaseColor('macrotask-execute') }} />
            <span className="text-[10px] text-[#888]">Macrotask</span>
          </div>
        </div>

        {/* Phase Details */}
        <div className="flex-1 overflow-auto space-y-2">
          <AnimatePresence mode="popLayout">
            {timeline.map((event, index) => {
              const isActive = currentEvent?.id === event.id

              return (
                <motion.button
                  key={event.id}
                  onClick={() => goToStep(event.startStep)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    isActive
                      ? 'border-white/30 bg-white/5'
                      : 'border-[#333] bg-[#1a1a1a] hover:border-[#444]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPhaseColor(event.phase) }}
                      />
                      <span
                        className="font-medium text-sm"
                        style={{ color: isActive ? 'white' : getPhaseColor(event.phase) }}
                      >
                        {event.label}
                      </span>
                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-black rounded"
                        >
                          CURRENT
                        </motion.span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#666]">
                      Steps {event.startStep + 1}-{event.endStep + 1}
                    </span>
                  </div>
                  <div className="text-xs text-[#888]">{event.description}</div>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default TimelinePanel
