'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'

export function ExecutionContextPanel() {
  const currentPhase = useExecutionStore((s) => s.currentPhase)
  const currentDescription = useExecutionStore((s) => s.currentDescription)
  const currentExplanation = useExecutionStore((s) => s.currentExplanation)
  const currentLine = useExecutionStore((s) => s.currentLine)
  const callStack = useExecutionStore((s) => s.callStack)
  const virtualTime = useExecutionStore((s) => s.virtualTime)

  const phaseColors: Record<string, { bg: string; text: string; border: string }> = {
    sync: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
    microtask: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' },
    macrotask: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
    idle: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500' },
  }

  const currentColor = phaseColors[currentPhase] || phaseColors.idle
  const activeFrame = callStack.length > 0 ? callStack[callStack.length - 1] : null

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>EXECUTION CONTEXT</span>
        </div>
        <span className="text-xs font-normal text-[#666]">{virtualTime}ms</span>
      </div>

      <div className="panel-content flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase + currentDescription}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Active Scope */}
            <div className={`rounded-lg border-2 p-4 ${currentColor.bg} ${currentColor.border}`}>
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  className={`w-2.5 h-2.5 rounded-full ${currentColor.text.replace('text-', 'bg-')}`}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className={`font-medium ${currentColor.text}`}>
                  {activeFrame?.name?.toUpperCase() || 'IDLE'} ({currentPhase.toUpperCase()})
                </span>
              </div>

              {currentLine && currentLine > 0 ? (
                <div className="text-xs text-[#888]">Executing line {currentLine}</div>
              ) : (
                <div className="text-xs text-[#666]">Ready</div>
              )}
            </div>

            {/* Current Phase Info */}
            <div className="rounded-lg border border-[#333] bg-[#1a1a1a] p-4">
              <div className="text-xs text-[#666] uppercase tracking-wider mb-2 font-medium">Current Action</div>
              <div className={`text-sm ${currentColor.text}`}>{currentDescription || 'Ready to execute'}</div>
              {currentLine && currentLine > 0 && <div className="mt-2 text-xs text-[#666]">Line {currentLine}</div>}
            </div>

            {/* Explanation Box - Educational Content */}
            {currentExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-cyan-400 text-lg">💡</span>
                  <span className="text-xs text-cyan-400 uppercase tracking-wider font-medium">Learn</span>
                </div>
                <div className="text-sm text-cyan-200/80 leading-relaxed">{currentExplanation}</div>
              </motion.div>
            )}

            {/* Phase Legend */}
            <div className="space-y-2">
              <div className="text-xs text-[#666] uppercase tracking-wider font-medium">Event Loop Phase</div>
              <div className="grid grid-cols-2 gap-2">
                <PhaseIndicator label="Sync" color="blue" isActive={currentPhase === 'sync'} />
                <PhaseIndicator label="Microtask" color="purple" isActive={currentPhase === 'microtask'} />
                <PhaseIndicator label="Macrotask" color="green" isActive={currentPhase === 'macrotask'} />
                <PhaseIndicator label="Idle" color="gray" isActive={currentPhase === 'idle'} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function PhaseIndicator({
  label,
  color,
  isActive,
}: {
  label: string
  color: 'blue' | 'purple' | 'green' | 'gray'
  isActive: boolean
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-400' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-400' },
    green: { bg: 'bg-green-500', text: 'text-green-400' },
    gray: { bg: 'bg-gray-500', text: 'text-gray-400' },
  }

  return (
    <div
      className={`
        flex items-center gap-2 px-2 py-1.5 rounded text-xs
        ${isActive ? 'bg-[#252525]' : 'bg-transparent'}
      `}
    >
      <motion.div
        className={`w-2 h-2 rounded-full ${colorMap[color].bg}`}
        animate={isActive ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
        style={{ opacity: isActive ? 1 : 0.4 }}
      />
      <span className={isActive ? colorMap[color].text : 'text-[#666]'}>{label}</span>
    </div>
  )
}
