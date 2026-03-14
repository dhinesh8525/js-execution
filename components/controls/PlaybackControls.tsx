'use client'

import { useExecutionStore } from '@/stores/executionStore'

interface PlaybackControlsProps {
  onStepForward: () => void
  onStepBackward: () => void
  onPlay: () => void
  onPause: () => void
  onReset: () => void
}

export function PlaybackControls({
  onStepForward,
  onStepBackward,
  onPlay,
  onPause,
  onReset,
}: PlaybackControlsProps) {
  const { isAutoPlaying, currentStep, totalSteps, status } = useExecutionStore()

  const canStepBack = currentStep > -1
  const canStepForward = currentStep < totalSteps - 1
  const canPlay = totalSteps > 0 && currentStep < totalSteps - 1
  const isComplete = status === 'complete'

  return (
    <div className="flex items-center gap-1">
      {/* Reset/Restart */}
      <button
        onClick={onReset}
        disabled={totalSteps === 0}
        className="btn-icon"
        title="Reset (R)"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* Step Back */}
      <button
        onClick={onStepBackward}
        disabled={!canStepBack}
        className="btn-icon"
        title="Step Back (←)"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
          />
        </svg>
      </button>

      {/* Play/Pause */}
      {isAutoPlaying ? (
        <button
          onClick={onPause}
          className="btn-icon bg-accent-blue hover:bg-blue-600 rounded-full p-2"
          title="Pause (Space)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        </button>
      ) : (
        <button
          onClick={onPlay}
          disabled={!canPlay}
          className="btn-icon bg-accent-blue hover:bg-blue-600 disabled:bg-gray-700 rounded-full p-2"
          title="Play (Space)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      {/* Step Forward */}
      <button
        onClick={onStepForward}
        disabled={!canStepForward}
        className="btn-icon"
        title="Step Forward (→)"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
          />
        </svg>
      </button>

      {/* Step counter */}
      <div className="ml-2 text-xs text-gray-400 font-mono min-w-[80px]">
        {totalSteps > 0 ? (
          <>
            <span className="text-white">{Math.max(0, currentStep + 1)}</span>
            <span> / {totalSteps}</span>
          </>
        ) : (
          <span>No steps</span>
        )}
      </div>

      {/* Status indicator */}
      {isComplete && (
        <span className="ml-2 px-2 py-0.5 text-xs bg-green-900/50 text-green-400 rounded">
          Complete
        </span>
      )}
    </div>
  )
}
