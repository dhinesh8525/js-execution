'use client'

import { motion } from 'framer-motion'
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
  const { playbackSpeed, setPlaybackSpeed, status, currentLine, currentDescription } = useExecutionStore()

  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0
  const canPlay = totalSteps > 0 && currentStep < totalSteps - 1
  const canStepBack = currentStep > 0
  const canStepForward = currentStep < totalSteps - 1

  return (
    <div className="panel">
      <div className="p-4 space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-3">
          {/* Step Backward */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStepBackward}
            disabled={!canStepBack}
            className="btn-control"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
            </svg>
          </motion.button>

          {/* Play/Pause */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isPlaying ? onPause : onPlay}
            disabled={!canPlay && !isPlaying}
            className={`btn-play ${isPlaying ? 'animate-pulse-glow' : ''}`}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </motion.button>

          {/* Step Forward */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStepForward}
            disabled={!canStepForward}
            className="btn-control"
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
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>
        </div>

        {/* Step Counter & Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#888]">
              Step {Math.max(0, currentStep + 1)} of {totalSteps}
            </span>
            <span className="text-blue-400">{Math.round(progress)}%</span>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2">
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

        {/* Keyboard Hints */}
        <div className="flex items-center justify-center gap-4 text-xs text-[#666]">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[#252525] rounded">←</kbd>
            <span>/</span>
            <kbd className="px-1.5 py-0.5 bg-[#252525] rounded">→</kbd>
            <span className="ml-1">to navigate,</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[#252525] rounded">Space</kbd>
            <span className="ml-1">to play/pause</span>
          </span>
        </div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-[#252525] border border-[#333]"
        >
          <div className="flex items-center gap-2 mb-1">
            <motion.span
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                status === 'complete'
                  ? 'bg-green-500/20 text-green-400'
                  : status === 'running'
                  ? 'bg-blue-500/20 text-blue-400'
                  : status === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-[#333] text-[#888]'
              }`}
              animate={status === 'running' ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {status === 'complete' ? 'Complete' : status === 'running' ? 'Running' : status === 'error' ? 'Error' : 'Ready'}
            </motion.span>
            {currentLine && currentLine > 0 && (
              <span className="text-xs text-[#666]">Line {currentLine}</span>
            )}
          </div>
          <div className="text-sm text-[#888]">
            {currentDescription || (status === 'complete'
              ? 'Program execution complete'
              : status === 'running'
              ? 'Executing...'
              : status === 'error'
              ? 'Execution failed'
              : 'Click Run to start')}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
