'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcuts {
  onRun?: () => void
  onPlay?: () => void
  onPause?: () => void
  onStepForward?: () => void
  onStepBackward?: () => void
  onReset?: () => void
  isPlaying?: boolean
}

export function useKeyboardShortcuts({
  onRun,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  isPlaying = false,
}: KeyboardShortcuts) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if typing in editor
      const target = e.target as HTMLElement
      if (
        target.closest('.monaco-editor') ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        return
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (isPlaying) {
            onPause?.()
          } else {
            onPlay?.()
          }
          break

        case 'ArrowRight':
          e.preventDefault()
          onStepForward?.()
          break

        case 'ArrowLeft':
          e.preventDefault()
          onStepBackward?.()
          break

        case 'r':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            onReset?.()
          }
          break

        case 'Enter':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            onRun?.()
          }
          break

        case 'Escape':
          if (isPlaying) {
            onPause?.()
          }
          break
      }
    },
    [onRun, onPlay, onPause, onStepForward, onStepBackward, onReset, isPlaying]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
