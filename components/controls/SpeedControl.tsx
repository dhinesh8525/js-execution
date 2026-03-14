'use client'

import { useExecutionStore } from '@/stores/executionStore'
import { PLAYBACK_SPEEDS } from '@/lib/constants'

export function SpeedControl() {
  const { playbackSpeed, setPlaybackSpeed } = useExecutionStore()

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Speed:</span>
      <div className="flex items-center bg-editor-bg rounded-md p-0.5">
        {PLAYBACK_SPEEDS.map((speed) => (
          <button
            key={speed}
            onClick={() => setPlaybackSpeed(speed)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              playbackSpeed === speed
                ? 'bg-accent-blue text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  )
}
