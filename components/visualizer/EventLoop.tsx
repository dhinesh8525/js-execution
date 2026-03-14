'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { AsyncTask, EventLoopPhase } from '@/types/execution'

interface EventLoopProps {
  phase: EventLoopPhase
  callbackQueue: AsyncTask[]
  microtaskQueue: AsyncTask[]
}

export function EventLoop({ phase, callbackQueue, microtaskQueue }: EventLoopProps) {
  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">Event Loop</div>

      <div className="panel-content flex-1 overflow-auto space-y-4">
        {/* Current Phase Indicator */}
        <div className="flex items-center justify-center">
          <PhaseIndicator phase={phase} />
        </div>

        {/* Visual Event Loop Diagram */}
        <div className="relative">
          <EventLoopDiagram
            phase={phase}
            callbackQueue={callbackQueue}
            microtaskQueue={microtaskQueue}
          />
        </div>

        {/* Queues */}
        <div className="space-y-3">
          <QueuePanel
            title="Microtask Queue"
            description="Promises, queueMicrotask"
            tasks={microtaskQueue}
            color="purple"
            isActive={phase === 'microtask'}
          />

          <QueuePanel
            title="Callback Queue"
            description="setTimeout, setInterval, I/O"
            tasks={callbackQueue}
            color="blue"
            isActive={phase === 'macrotask'}
          />
        </div>
      </div>
    </div>
  )
}

interface PhaseIndicatorProps {
  phase: EventLoopPhase
}

function PhaseIndicator({ phase }: PhaseIndicatorProps) {
  const phases: { id: EventLoopPhase; label: string }[] = [
    { id: 'call-stack', label: 'Call Stack' },
    { id: 'microtask', label: 'Microtasks' },
    { id: 'macrotask', label: 'Callbacks' },
    { id: 'render', label: 'Render' },
  ]

  return (
    <div className="flex items-center gap-1">
      {phases.map((p, index) => (
        <div key={p.id} className="flex items-center">
          <div
            className={`px-2 py-1 text-xs rounded ${
              phase === p.id
                ? 'bg-accent-blue text-white'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {p.label}
          </div>
          {index < phases.length - 1 && (
            <svg className="w-4 h-4 text-gray-600 mx-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

interface EventLoopDiagramProps {
  phase: EventLoopPhase
  callbackQueue: AsyncTask[]
  microtaskQueue: AsyncTask[]
}

function EventLoopDiagram({ phase, callbackQueue, microtaskQueue }: EventLoopDiagramProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="relative w-32 h-32">
        {/* Circular track */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#3c3c3c"
            strokeWidth="8"
          />
          {/* Animated progress arc */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#007acc"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{
              strokeDashoffset: phase === 'call-stack' ? 188.4 : phase === 'microtask' ? 125.6 : phase === 'macrotask' ? 62.8 : 0,
            }}
            transition={{ duration: 0.5 }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs text-gray-400">Phase</div>
            <div className="text-sm font-medium text-white capitalize">
              {phase.replace('-', ' ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface QueuePanelProps {
  title: string
  description: string
  tasks: AsyncTask[]
  color: 'blue' | 'purple' | 'green'
  isActive: boolean
}

function QueuePanel({ title, description, tasks, color, isActive }: QueuePanelProps) {
  const colorClasses = {
    blue: 'border-blue-600 bg-blue-900/20',
    purple: 'border-purple-600 bg-purple-900/20',
    green: 'border-green-600 bg-green-900/20',
  }

  return (
    <div
      className={`rounded-lg border-l-4 p-3 ${colorClasses[color]} ${
        isActive ? 'ring-1 ring-white/20' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-gray-400">{description}</div>
        </div>
        <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-xs text-gray-500">Empty</div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="flex flex-wrap gap-1">
            {tasks.slice(0, 5).map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="px-2 py-1 bg-gray-700 rounded text-xs"
              >
                {task.callback || task.type}
              </motion.div>
            ))}
            {tasks.length > 5 && (
              <div className="px-2 py-1 text-xs text-gray-400">
                +{tasks.length - 5} more
              </div>
            )}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
