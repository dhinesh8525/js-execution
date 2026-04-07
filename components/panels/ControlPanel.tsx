'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'
import { PLAYBACK_SPEEDS } from '@/lib/constants'

interface ControlPanelProps {
  onPlay: () => void
  onPause: () => void
  onStepForward: () => void
  onStepBackward: () => void
  onReset: () => void
  onSeek: (step: number) => void
  isPlaying: boolean
  currentStep: number
  totalSteps: number
}

export function ControlPanel({
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  isPlaying,
  currentStep,
  totalSteps,
}: ControlPanelProps) {
  const {
    playbackSpeed,
    setPlaybackSpeed,
    status,
    currentLine,
    currentDescription,
    stepDiff,
    currentPhase,
    steps,
  } = useExecutionStore()

  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0
  const canPlay = totalSteps > 0 && currentStep < totalSteps - 1 && status !== 'complete'
  const canStepBack = currentStep > 0
  const canStepForward = currentStep < totalSteps - 1

  // Get current step type for display
  const currentStepData = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null
  const stepType = currentStepData?.type

  // Color based on phase
  const phaseColors = {
    sync: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500' },
    microtask: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500' },
    macrotask: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' },
    idle: { bg: 'bg-gray-500', text: 'text-gray-400', border: 'border-gray-500' },
  }
  const phaseColor = phaseColors[currentPhase] || phaseColors.idle

  return (
    <div className="panel">
      <div className="p-4 space-y-4">
        {/* Step Counter - Prominent */}
        <div className="text-center">
          <div className="text-4xl font-bold text-white tabular-nums">
            {currentStep >= 0 ? currentStep + 1 : 0}
            <span className="text-xl text-[#666]"> / {totalSteps}</span>
          </div>
          <div className="text-xs text-[#888] mt-1 uppercase tracking-wider">
            {status === 'complete'
              ? 'Execution Complete'
              : status === 'running'
                ? 'Running...'
                : status === 'ready'
                  ? 'Ready to Execute'
                  : status === 'error'
                    ? 'Error'
                    : 'Click Run to Load'}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          {/* Step Backward */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStepBackward}
            disabled={!canStepBack}
            className="btn-control"
            title="Step Backward (←)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </motion.button>

          {/* Play/Pause - Larger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isPlaying ? onPause : onPlay}
            disabled={!canPlay && !isPlaying}
            className={`btn-play ${isPlaying ? 'animate-pulse-glow' : ''}`}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </motion.button>

          {/* Step Forward - Highlighted as primary action */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStepForward}
            disabled={!canStepForward}
            className={`btn-control ${canStepForward ? 'ring-2 ring-cyan-500/50' : ''}`}
            title="Step Forward (→)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
            </svg>
          </motion.button>

          {/* Reset */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            disabled={totalSteps === 0}
            className="btn-control"
            title="Reset (R)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#666]">
            <span>0</span>
            <span>{Math.round(progress)}%</span>
            <span>{totalSteps}</span>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#666]">Speed:</span>
          <div className="flex items-center gap-1">
            {PLAYBACK_SPEEDS.map((speed) => (
              <motion.button
                key={speed}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPlaybackSpeed(speed)}
                className={`speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
              >
                {speed}x
              </motion.button>
            ))}
          </div>
        </div>

        {/* Current Step Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`p-3 rounded-lg border-2 ${phaseColor.border} bg-[#1a1a1a]`}
          >
            {/* Step Type Badge */}
            <div className="flex items-center gap-2 mb-2">
              <motion.span
                className={`px-2 py-0.5 text-xs font-medium rounded ${phaseColor.bg}/20 ${phaseColor.text}`}
                animate={status === 'running' ? { opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {currentPhase.toUpperCase()}
              </motion.span>
              {stepType && (
                <span className="text-xs text-[#666] font-mono">{stepType.replace(/-/g, ' ')}</span>
              )}
              {currentLine && currentLine > 0 && (
                <span className="text-xs text-[#666] ml-auto">Line {currentLine}</span>
              )}
            </div>

            {/* Description */}
            <div className={`text-sm ${phaseColor.text}`}>{currentDescription || 'Ready to execute'}</div>
          </motion.div>
        </AnimatePresence>

        {/* What Changed This Step */}
        {stepDiff && stepDiff.changes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 rounded-lg bg-[#252525] border border-[#333]"
          >
            <div className="text-xs text-[#666] uppercase tracking-wider mb-2 font-medium flex items-center gap-2">
              <span className="text-cyan-400">⚡</span>
              What Changed
            </div>
            <div className="space-y-1.5">
              {stepDiff.changes.slice(0, 4).map((change, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <ChangeIcon type={change.type} />
                  <span className="text-[#ccc]">{change.description}</span>
                </motion.div>
              ))}
              {stepDiff.changes.length > 4 && (
                <div className="text-xs text-[#666]">+{stepDiff.changes.length - 4} more changes</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Keyboard Hints - Compact */}
        <div className="flex items-center justify-center gap-3 text-[10px] text-[#555]">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-[#252525] rounded text-[#888]">Space</kbd>
            <span>play</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-[#252525] rounded text-[#888]">←</kbd>
            <kbd className="px-1 py-0.5 bg-[#252525] rounded text-[#888]">→</kbd>
            <span>step</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-[#252525] rounded text-[#888]">R</kbd>
            <span>reset</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// Icon component for change types
function ChangeIcon({ type }: { type: string }) {
  const icons: Record<string, { icon: string; color: string }> = {
    'call-stack-push': { icon: '↓', color: 'text-blue-400' },
    'call-stack-pop': { icon: '↑', color: 'text-blue-400' },
    'microtask-add': { icon: '+', color: 'text-purple-400' },
    'microtask-remove': { icon: '✓', color: 'text-purple-400' },
    'macrotask-add': { icon: '+', color: 'text-green-400' },
    'macrotask-remove': { icon: '✓', color: 'text-green-400' },
    'timer-add': { icon: '⏱', color: 'text-orange-400' },
    'timer-remove': { icon: '✓', color: 'text-orange-400' },
    'console-add': { icon: '>', color: 'text-cyan-400' },
    'phase-change': { icon: '→', color: 'text-yellow-400' },
  }

  const { icon, color } = icons[type] || { icon: '•', color: 'text-gray-400' }

  return <span className={`font-bold w-4 text-center ${color}`}>{icon}</span>
}
