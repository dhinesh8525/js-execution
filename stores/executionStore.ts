import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  ExecutionStep,
  ExecutionMode,
  AlgorithmType,
  StackFrame,
  MicrotaskItem,
  MacrotaskItem,
  WebApiTimer,
  ConsoleOutput,
  EventLoopPhase,
  LineHighlight,
  VisualConnection,
  ArrayState,
  VariableState,
  RecursionFrame,
  TreeNodeState,
  GraphState,
  DPTableState,
} from '@/engine/simulator'
import { isJSRuntimeStep, isDSAStep } from '@/engine/simulator/types'
import {
  computeStepDiff,
  type StepDiff,
  type StepChange,
} from '@/engine/simulator/ExecutionController'

// Re-export types for components
export type { EventLoopPhase, StepDiff, StepChange, LineHighlight, VisualConnection }

export type ExecutionStatus = 'idle' | 'ready' | 'running' | 'paused' | 'complete' | 'error'

interface ExecutionState {
  // ============================================================================
  // Core Step Data
  // ============================================================================
  steps: ExecutionStep[]
  currentStep: number
  totalSteps: number

  // ============================================================================
  // Mode Detection
  // ============================================================================
  executionMode: ExecutionMode
  algorithmType: AlgorithmType | null
  modeConfidence: number
  manualModeOverride: ExecutionMode | null

  // ============================================================================
  // JS Runtime State (populated when mode === 'JS_RUNTIME')
  // ============================================================================
  callStack: StackFrame[]
  webApiTimers: WebApiTimer[]
  macrotaskQueue: MacrotaskItem[]
  microtaskQueue: MicrotaskItem[]
  currentPhase: EventLoopPhase
  scheduledFromLine: number | null
  connections: VisualConnection[]
  virtualTime: number

  // ============================================================================
  // DSA State (populated when mode === 'DSA')
  // ============================================================================
  arrays: ArrayState[]
  variables: VariableState[]
  recursionStack: RecursionFrame[]
  treeState: TreeNodeState | null
  graphState: GraphState | null
  dpTable: DPTableState | null

  // DSA Metrics
  totalComparisons: number
  totalSwaps: number
  maxRecursionDepth: number

  // ============================================================================
  // Shared State (both modes)
  // ============================================================================
  consoleOutput: ConsoleOutput[]
  currentLine: number | null
  currentLabel: string | null
  currentDescription: string
  currentExplanation: string | null
  highlights: LineHighlight[]
  stepDiff: StepDiff | null

  // ============================================================================
  // Execution Control
  // ============================================================================
  status: ExecutionStatus
  isAutoPlaying: boolean
  playbackSpeed: number
  error: { message: string; line?: number } | null

  // ============================================================================
  // Actions
  // ============================================================================
  setSteps: (steps: ExecutionStep[], mode?: ExecutionMode, algorithmType?: AlgorithmType | null) => void
  setMode: (mode: ExecutionMode, algorithmType?: AlgorithmType | null) => void
  setManualModeOverride: (mode: ExecutionMode | null) => void
  goToStep: (step: number) => void
  nextStep: () => boolean
  prevStep: () => boolean
  play: () => void
  pause: () => void
  reset: () => void
  setPlaybackSpeed: (speed: number) => void
  setError: (error: ExecutionState['error']) => void

  // Helpers
  canStepForward: () => boolean
  canStepBackward: () => boolean
  canPlay: () => boolean
  getProgress: () => number
}

export const useExecutionStore = create<ExecutionState>()(
  immer((set, get) => ({
    // Core step data
    steps: [],
    currentStep: -1,
    totalSteps: 0,

    // Mode detection
    executionMode: 'JS_RUNTIME',
    algorithmType: null,
    modeConfidence: 1,
    manualModeOverride: null,

    // JS Runtime state
    callStack: [],
    webApiTimers: [],
    macrotaskQueue: [],
    microtaskQueue: [],
    currentPhase: 'idle',
    scheduledFromLine: null,
    connections: [],
    virtualTime: 0,

    // DSA state
    arrays: [],
    variables: [],
    recursionStack: [],
    treeState: null,
    graphState: null,
    dpTable: null,
    totalComparisons: 0,
    totalSwaps: 0,
    maxRecursionDepth: 0,

    // Shared state
    consoleOutput: [],
    currentLine: null,
    currentLabel: null,
    currentDescription: '',
    currentExplanation: null,
    highlights: [],
    stepDiff: null,

    // Execution control
    status: 'idle',
    isAutoPlaying: false,
    playbackSpeed: 1,
    error: null,

    // ============================================================================
    // Actions
    // ============================================================================

    setSteps: (steps, mode, algorithmType) =>
      set((state) => {
        state.steps = steps
        state.totalSteps = steps.length
        state.currentStep = -1
        state.status = steps.length > 0 ? 'ready' : 'idle'

        // Set mode from parameter or detect from first step
        if (mode) {
          state.executionMode = mode
        } else if (steps.length > 0) {
          state.executionMode = steps[0].mode
        }

        // Set algorithm type
        if (algorithmType !== undefined) {
          state.algorithmType = algorithmType
        } else if (steps.length > 0 && isDSAStep(steps[0])) {
          state.algorithmType = steps[0].algorithmType
        } else {
          state.algorithmType = null
        }

        // Reset all mode-specific state
        // JS Runtime
        state.callStack = []
        state.webApiTimers = []
        state.macrotaskQueue = []
        state.microtaskQueue = []
        state.currentPhase = 'idle'
        state.scheduledFromLine = null
        state.connections = []
        state.virtualTime = 0

        // DSA
        state.arrays = []
        state.variables = []
        state.recursionStack = []
        state.treeState = null
        state.graphState = null
        state.dpTable = null
        state.totalComparisons = 0
        state.totalSwaps = 0
        state.maxRecursionDepth = 0

        // Shared
        state.consoleOutput = []
        state.currentLine = null
        state.currentLabel = null
        state.currentDescription = 'Ready to execute. Press Step or Play to begin.'
        state.currentExplanation = null
        state.highlights = []
        state.stepDiff = null
        state.error = null
        state.isAutoPlaying = false
      }),

    setMode: (mode, algorithmType) =>
      set((state) => {
        state.executionMode = mode
        state.algorithmType = algorithmType ?? null
      }),

    setManualModeOverride: (mode) =>
      set((state) => {
        state.manualModeOverride = mode
      }),

    goToStep: (stepIndex) =>
      set((state) => {
        if (stepIndex < 0 || stepIndex >= state.totalSteps) return

        const nextStep = state.steps[stepIndex]

        // Compute diff from previous step (only for JS Runtime mode)
        if (isJSRuntimeStep(nextStep)) {
          const diffPrevStep = stepIndex > 0 ? state.steps[stepIndex - 1] : null
          if (diffPrevStep && isJSRuntimeStep(diffPrevStep)) {
            state.stepDiff = computeStepDiff(diffPrevStep, nextStep)
          } else {
            state.stepDiff = null
          }
        } else {
          state.stepDiff = null
        }

        state.currentStep = stepIndex

        // Update state based on step mode
        if (isJSRuntimeStep(nextStep)) {
          // JS Runtime state
          state.callStack = nextStep.callStack
          state.webApiTimers = nextStep.webApiTimers
          state.macrotaskQueue = nextStep.macrotaskQueue
          state.microtaskQueue = nextStep.microtaskQueue
          state.consoleOutput = nextStep.consoleOutput
          state.currentPhase = nextStep.phase
          state.currentLine = nextStep.currentLine
          state.currentLabel = nextStep.lineLabel || null
          state.currentDescription = nextStep.description
          state.currentExplanation = nextStep.explanation || null
          state.scheduledFromLine = nextStep.scheduledFromLine || null
          state.highlights = nextStep.highlights || []
          state.connections = nextStep.connections || []
          state.virtualTime = nextStep.virtualTime
        } else if (isDSAStep(nextStep)) {
          // DSA state
          state.arrays = nextStep.arrays
          state.variables = nextStep.variables
          state.recursionStack = nextStep.recursionStack
          state.treeState = nextStep.treeState
          state.graphState = nextStep.graphState
          state.dpTable = nextStep.dpTable
          state.consoleOutput = nextStep.consoleOutput
          state.currentLine = nextStep.currentLine
          state.currentLabel = null
          state.currentDescription = nextStep.description
          state.currentExplanation = nextStep.explanation || null
          state.highlights = nextStep.highlights || []

          // Update metrics
          state.totalComparisons = nextStep.comparisons
          state.totalSwaps = nextStep.swaps
          state.maxRecursionDepth = Math.max(state.maxRecursionDepth, nextStep.recursionDepth)
        }

        // Update status
        if (stepIndex === state.totalSteps - 1) {
          state.status = 'complete'
          state.isAutoPlaying = false
        } else if (state.status !== 'running') {
          state.status = 'paused'
        }
      }),

    nextStep: () => {
      const { currentStep, totalSteps, goToStep, status } = get()
      if (status === 'idle' || status === 'error') return false
      if (currentStep < totalSteps - 1) {
        goToStep(currentStep + 1)
        return true
      }
      return false
    },

    prevStep: () => {
      const { currentStep, goToStep, status } = get()
      if (status === 'idle') return false
      if (currentStep > 0) {
        goToStep(currentStep - 1)
        return true
      }
      return false
    },

    play: () =>
      set((state) => {
        if (state.status === 'ready' || state.status === 'paused') {
          state.isAutoPlaying = true
          state.status = 'running'
        }
      }),

    pause: () =>
      set((state) => {
        state.isAutoPlaying = false
        if (state.status === 'running') {
          state.status = 'paused'
        }
      }),

    reset: () =>
      set((state) => {
        state.currentStep = -1
        state.status = state.steps.length > 0 ? 'ready' : 'idle'
        state.isAutoPlaying = false

        // Reset JS Runtime state
        state.callStack = []
        state.webApiTimers = []
        state.macrotaskQueue = []
        state.microtaskQueue = []
        state.currentPhase = 'idle'
        state.scheduledFromLine = null
        state.connections = []
        state.virtualTime = 0

        // Reset DSA state
        state.arrays = []
        state.variables = []
        state.recursionStack = []
        state.treeState = null
        state.graphState = null
        state.dpTable = null
        state.totalComparisons = 0
        state.totalSwaps = 0
        state.maxRecursionDepth = 0

        // Reset shared state
        state.consoleOutput = []
        state.currentLine = null
        state.currentLabel = null
        state.currentDescription = 'Ready to execute. Press Step or Play to begin.'
        state.currentExplanation = null
        state.highlights = []
        state.stepDiff = null
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

    // ============================================================================
    // Helpers
    // ============================================================================

    canStepForward: () => {
      const { status, currentStep, totalSteps } = get()
      return status !== 'idle' && status !== 'error' && currentStep < totalSteps - 1
    },

    canStepBackward: () => {
      const { status, currentStep } = get()
      return status !== 'idle' && currentStep > 0
    },

    canPlay: () => {
      const { status, currentStep, totalSteps } = get()
      return (status === 'ready' || status === 'paused') && currentStep < totalSteps - 1
    },

    getProgress: () => {
      const { currentStep, totalSteps } = get()
      if (totalSteps === 0) return 0
      return Math.round(((currentStep + 1) / totalSteps) * 100)
    },
  }))
)
