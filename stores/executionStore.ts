import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { SimulatorStep, CallStackItem, WebApiItem, QueueItem, ConsoleOutputItem } from '@/engine/simulator/eventLoopSimulator'

export type EventLoopPhase = 'sync' | 'microtask' | 'macrotask' | 'idle'

interface ExecutionState {
  // Step data
  steps: SimulatorStep[]
  currentStep: number
  totalSteps: number

  // Runtime state at current step
  callStack: CallStackItem[]
  webApis: WebApiItem[]
  taskQueue: QueueItem[]
  microtaskQueue: QueueItem[]
  consoleOutput: ConsoleOutputItem[]

  // Current phase and line
  currentPhase: EventLoopPhase
  currentLine: number | null
  currentLabel: string | null
  currentDescription: string

  // Execution control
  status: 'idle' | 'running' | 'paused' | 'complete' | 'error'
  isAutoPlaying: boolean
  playbackSpeed: number
  error: { message: string; line?: number } | null

  // Actions
  setSteps: (steps: SimulatorStep[]) => void
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  play: () => void
  pause: () => void
  reset: () => void
  setPlaybackSpeed: (speed: number) => void
  setError: (error: ExecutionState['error']) => void
}

export const useExecutionStore = create<ExecutionState>()(
  immer((set, get) => ({
    steps: [],
    currentStep: -1,
    totalSteps: 0,

    callStack: [],
    webApis: [],
    taskQueue: [],
    microtaskQueue: [],
    consoleOutput: [],

    currentPhase: 'idle',
    currentLine: null,
    currentLabel: null,
    currentDescription: '',

    status: 'idle',
    isAutoPlaying: false,
    playbackSpeed: 1,
    error: null,

    setSteps: (steps) =>
      set((state) => {
        state.steps = steps
        state.totalSteps = steps.length
        state.currentStep = -1
        state.status = steps.length > 0 ? 'paused' : 'idle'
        state.callStack = [{ id: 'global', name: 'Global', line: 1 }]
        state.webApis = []
        state.taskQueue = []
        state.microtaskQueue = []
        state.consoleOutput = []
        state.currentPhase = 'idle'
        state.currentLine = null
        state.currentLabel = null
        state.currentDescription = 'Ready to execute'
        state.error = null
      }),

    goToStep: (stepIndex) =>
      set((state) => {
        if (stepIndex < 0 || stepIndex >= state.totalSteps) return

        state.currentStep = stepIndex
        const step = state.steps[stepIndex]

        // Update state from step snapshot
        state.callStack = step.callStack
        state.webApis = step.webApis
        state.taskQueue = step.taskQueue
        state.microtaskQueue = step.microtaskQueue
        state.consoleOutput = step.consoleOutput
        state.currentPhase = step.phase as EventLoopPhase
        state.currentLine = step.highlightedCode?.line || null
        state.currentLabel = step.highlightedCode?.label || null
        state.currentDescription = step.description

        if (stepIndex === state.totalSteps - 1) {
          state.status = 'complete'
          state.isAutoPlaying = false
        }
      }),

    nextStep: () => {
      const { currentStep, totalSteps, goToStep } = get()
      if (currentStep < totalSteps - 1) {
        goToStep(currentStep + 1)
      }
    },

    prevStep: () => {
      const { currentStep, goToStep } = get()
      if (currentStep > 0) {
        goToStep(currentStep - 1)
      }
    },

    play: () =>
      set((state) => {
        state.isAutoPlaying = true
        state.status = 'running'
      }),

    pause: () =>
      set((state) => {
        state.isAutoPlaying = false
        state.status = 'paused'
      }),

    reset: () =>
      set((state) => {
        state.currentStep = -1
        state.status = state.steps.length > 0 ? 'paused' : 'idle'
        state.isAutoPlaying = false
        state.callStack = [{ id: 'global', name: 'Global', line: 1 }]
        state.webApis = []
        state.taskQueue = []
        state.microtaskQueue = []
        state.consoleOutput = []
        state.currentPhase = 'idle'
        state.currentLine = null
        state.currentLabel = null
        state.currentDescription = 'Ready to execute'
      }),

    setPlaybackSpeed: (speed) =>
      set((state) => {
        state.playbackSpeed = speed
      }),

    setError: (error) =>
      set((state) => {
        state.error = error
        state.status = 'error'
        state.isAutoPlaying = false
      }),
  }))
)
