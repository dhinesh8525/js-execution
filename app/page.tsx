'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { useExecutionStore } from '@/stores/executionStore'
import { simulateEventLoop } from '@/engine/simulator/eventLoopSimulator'

// Dynamic imports to avoid hydration issues with Framer Motion
const CodeInputPanel = dynamic(
  () => import('@/components/panels/CodeInputPanel').then((m) => ({ default: m.CodeInputPanel })),
  { ssr: false }
)
const CallStackPanel = dynamic(
  () => import('@/components/panels/CallStackPanel').then((m) => ({ default: m.CallStackPanel })),
  { ssr: false }
)
const ExecutionContextPanel = dynamic(
  () =>
    import('@/components/panels/ExecutionContextPanel').then((m) => ({
      default: m.ExecutionContextPanel,
    })),
  { ssr: false }
)
const WebApisPanel = dynamic(
  () => import('@/components/panels/WebApisPanel').then((m) => ({ default: m.WebApisPanel })),
  { ssr: false }
)
const TaskQueuePanel = dynamic(
  () => import('@/components/panels/TaskQueuePanel').then((m) => ({ default: m.TaskQueuePanel })),
  { ssr: false }
)
const MicrotaskQueuePanel = dynamic(
  () =>
    import('@/components/panels/MicrotaskQueuePanel').then((m) => ({
      default: m.MicrotaskQueuePanel,
    })),
  { ssr: false }
)
const ConsolePanel = dynamic(
  () => import('@/components/panels/ConsolePanel').then((m) => ({ default: m.ConsolePanel })),
  { ssr: false }
)
const ControlPanel = dynamic(
  () => import('@/components/panels/ControlPanel').then((m) => ({ default: m.ControlPanel })),
  { ssr: false }
)
const EventLoopDiagram = dynamic(
  () =>
    import('@/components/panels/EventLoopDiagram').then((m) => ({ default: m.EventLoopDiagram })),
  { ssr: false }
)

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const code = useEditorStore((s) => s.code)
  const setHighlightedLine = useEditorStore((s) => s.setHighlightedLine)

  const setSteps = useExecutionStore((s) => s.setSteps)
  const goToStep = useExecutionStore((s) => s.goToStep)
  const nextStep = useExecutionStore((s) => s.nextStep)
  const prevStep = useExecutionStore((s) => s.prevStep)
  const play = useExecutionStore((s) => s.play)
  const pause = useExecutionStore((s) => s.pause)
  const reset = useExecutionStore((s) => s.reset)
  const setError = useExecutionStore((s) => s.setError)
  const isAutoPlaying = useExecutionStore((s) => s.isAutoPlaying)
  const playbackSpeed = useExecutionStore((s) => s.playbackSpeed)
  const currentStep = useExecutionStore((s) => s.currentStep)
  const totalSteps = useExecutionStore((s) => s.totalSteps)
  const currentLine = useExecutionStore((s) => s.currentLine)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync highlighted line with current step
  useEffect(() => {
    setHighlightedLine(currentLine)
  }, [currentLine, setHighlightedLine])

  const handleRun = useCallback(async () => {
    setIsRunning(true)
    reset()

    try {
      const steps = simulateEventLoop(code)

      if (steps.length > 0) {
        setSteps(steps)
        goToStep(0)
      } else {
        setError({ message: 'No executable code found' })
      }
    } catch (error) {
      setError({
        message: error instanceof Error ? error.message : 'Execution failed',
      })
    } finally {
      setIsRunning(false)
    }
  }, [code, reset, setSteps, goToStep, setError])

  const handleStepForward = useCallback(() => {
    nextStep()
  }, [nextStep])

  const handleStepBackward = useCallback(() => {
    prevStep()
  }, [prevStep])

  const handleSeek = useCallback(
    (step: number) => {
      goToStep(step)
    },
    [goToStep]
  )

  const handlePlay = useCallback(() => play(), [play])
  const handlePause = useCallback(() => pause(), [pause])

  const handleReset = useCallback(() => {
    reset()
    setHighlightedLine(null)
  }, [reset, setHighlightedLine])

  // Auto-play interval
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = 1000 / playbackSpeed
      playIntervalRef.current = setInterval(() => {
        const state = useExecutionStore.getState()
        if (state.currentStep < state.totalSteps - 1) {
          state.nextStep()
        } else {
          state.pause()
        }
      }, interval)

      return () => {
        if (playIntervalRef.current) {
          clearInterval(playIntervalRef.current)
          playIntervalRef.current = null
        }
      }
    }
  }, [isAutoPlaying, playbackSpeed])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('.monaco-editor')) return
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          isAutoPlaying ? handlePause() : handlePlay()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleStepForward()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handleStepBackward()
          break
        case 'r':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            handleReset()
          }
          break
        case 'Enter':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            handleRun()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isAutoPlaying,
    handlePlay,
    handlePause,
    handleStepForward,
    handleStepBackward,
    handleReset,
    handleRun,
  ])

  // Cleanup
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-[#252525]">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
          {'>_'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">JS Visualizer</h1>
          <p className="text-sm text-[#666]">Visualize JavaScript execution step by step</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Left Column - Code Input */}
        <div className="col-span-3 flex flex-col min-h-0">
          <CodeInputPanel onRun={handleRun} isRunning={isRunning} />
        </div>

        {/* Center Column - Visualization */}
        <div className="col-span-6 flex flex-col gap-4 min-h-0">
          {/* Top Row */}
          <div className="grid grid-cols-2 gap-4 flex-shrink-0" style={{ height: '35%' }}>
            <CallStackPanel />
            <ExecutionContextPanel />
          </div>

          {/* Middle Row - Queues */}
          <div className="grid grid-cols-3 gap-4 flex-shrink-0" style={{ height: '25%' }}>
            <WebApisPanel />
            <TaskQueuePanel />
            <MicrotaskQueuePanel />
          </div>

          {/* Bottom Row - Console */}
          <div className="flex-1 min-h-0">
            <ConsolePanel />
          </div>
        </div>

        {/* Right Column - Controls */}
        <div className="col-span-3 flex flex-col gap-4 min-h-0">
          <ControlPanel
            onPlay={handlePlay}
            onPause={handlePause}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            onReset={handleReset}
            onSeek={handleSeek}
            isPlaying={isAutoPlaying}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
          <EventLoopDiagram />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-2 border-t border-[#252525] text-xs text-[#666] flex items-center justify-between">
        <span>Built with React, TypeScript, and Framer Motion</span>
        <span className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-[#252525] rounded text-[#888]">Space</kbd>
          <span>to play/pause</span>
          <kbd className="px-1.5 py-0.5 bg-[#252525] rounded text-[#888]">←</kbd>
          <kbd className="px-1.5 py-0.5 bg-[#252525] rounded text-[#888]">→</kbd>
          <span>to navigate</span>
        </span>
      </footer>
    </div>
  )
}
