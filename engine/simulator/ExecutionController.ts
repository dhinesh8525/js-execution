/**
 * ExecutionController - State Machine for Step-by-Step Execution
 *
 * This controller manages the execution state without relying on setTimeout.
 * It provides a clean state machine interface for:
 * - step() - advance one step
 * - run() - start continuous playback
 * - pause() - stop continuous playback
 * - reset() - return to initial state
 *
 * The controller computes diffs between steps to highlight changes.
 */

import type {
  ExecutionStep,
  JSRuntimeStep,
  StackFrame,
  MicrotaskItem,
  MacrotaskItem,
  WebApiTimer,
  ConsoleOutput,
  EventLoopPhase,
} from './types'
import { isJSRuntimeStep } from './types'

// ============================================================================
// Change Detection Types
// ============================================================================

export type ChangeType =
  | 'call-stack-push'
  | 'call-stack-pop'
  | 'microtask-add'
  | 'microtask-remove'
  | 'macrotask-add'
  | 'macrotask-remove'
  | 'timer-add'
  | 'timer-remove'
  | 'console-add'
  | 'phase-change'

export interface StepChange {
  type: ChangeType
  itemId?: string
  description: string
}

export interface StepDiff {
  changes: StepChange[]
  addedToCallStack: StackFrame[]
  removedFromCallStack: StackFrame[]
  addedMicrotasks: MicrotaskItem[]
  removedMicrotasks: MicrotaskItem[]
  addedMacrotasks: MacrotaskItem[]
  removedMacrotasks: MacrotaskItem[]
  addedTimers: WebApiTimer[]
  removedTimers: WebApiTimer[]
  addedConsole: ConsoleOutput[]
  phaseChanged: boolean
  previousPhase?: string
  currentPhase?: string
}

// ============================================================================
// Execution State Machine
// ============================================================================

export type ExecutionState = 'idle' | 'ready' | 'running' | 'paused' | 'complete' | 'error'

export interface ControllerState {
  status: ExecutionState
  steps: ExecutionStep[]
  currentStepIndex: number
  diff: StepDiff | null
  error: string | null
}

export type ControllerAction =
  | { type: 'LOAD_STEPS'; steps: ExecutionStep[] }
  | { type: 'STEP_FORWARD' }
  | { type: 'STEP_BACKWARD' }
  | { type: 'GO_TO_STEP'; index: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SET_ERROR'; error: string }

/**
 * Pure reducer function for state transitions
 * This is the core of the state machine - no side effects
 */
export function controllerReducer(
  state: ControllerState,
  action: ControllerAction
): ControllerState {
  switch (action.type) {
    case 'LOAD_STEPS': {
      if (action.steps.length === 0) {
        return {
          ...state,
          status: 'error',
          steps: [],
          currentStepIndex: -1,
          diff: null,
          error: 'No steps to execute',
        }
      }
      return {
        status: 'ready',
        steps: action.steps,
        currentStepIndex: -1,
        diff: null,
        error: null,
      }
    }

    case 'STEP_FORWARD': {
      if (state.status === 'idle' || state.status === 'error') {
        return state
      }

      const nextIndex = state.currentStepIndex + 1
      if (nextIndex >= state.steps.length) {
        return {
          ...state,
          status: 'complete',
        }
      }

      const previousStep = state.currentStepIndex >= 0 ? state.steps[state.currentStepIndex] : null
      const currentStep = state.steps[nextIndex]
      const diff = computeStepDiff(previousStep, currentStep)

      return {
        ...state,
        status: nextIndex === state.steps.length - 1 ? 'complete' : state.status === 'running' ? 'running' : 'paused',
        currentStepIndex: nextIndex,
        diff,
      }
    }

    case 'STEP_BACKWARD': {
      if (state.status === 'idle' || state.currentStepIndex <= 0) {
        return state
      }

      const prevIndex = state.currentStepIndex - 1
      const previousStep = prevIndex > 0 ? state.steps[prevIndex - 1] : null
      const currentStep = state.steps[prevIndex]
      const diff = computeStepDiff(previousStep, currentStep)

      return {
        ...state,
        status: 'paused',
        currentStepIndex: prevIndex,
        diff,
      }
    }

    case 'GO_TO_STEP': {
      if (state.status === 'idle' || action.index < 0 || action.index >= state.steps.length) {
        return state
      }

      const previousStep = action.index > 0 ? state.steps[action.index - 1] : null
      const currentStep = state.steps[action.index]
      const diff = computeStepDiff(previousStep, currentStep)

      return {
        ...state,
        status: action.index === state.steps.length - 1 ? 'complete' : 'paused',
        currentStepIndex: action.index,
        diff,
      }
    }

    case 'PLAY': {
      if (state.status === 'idle' || state.status === 'complete' || state.status === 'error') {
        return state
      }
      return {
        ...state,
        status: 'running',
      }
    }

    case 'PAUSE': {
      if (state.status !== 'running') {
        return state
      }
      return {
        ...state,
        status: 'paused',
      }
    }

    case 'RESET': {
      if (state.steps.length === 0) {
        return {
          ...state,
          status: 'idle',
          currentStepIndex: -1,
          diff: null,
        }
      }
      return {
        ...state,
        status: 'ready',
        currentStepIndex: -1,
        diff: null,
      }
    }

    case 'SET_ERROR': {
      return {
        ...state,
        status: 'error',
        error: action.error,
      }
    }

    default:
      return state
  }
}

/**
 * Empty step diff for DSA mode or when diff not applicable
 */
const EMPTY_DIFF: StepDiff = {
  changes: [],
  addedToCallStack: [],
  removedFromCallStack: [],
  addedMicrotasks: [],
  removedMicrotasks: [],
  addedMacrotasks: [],
  removedMacrotasks: [],
  addedTimers: [],
  removedTimers: [],
  addedConsole: [],
  phaseChanged: false,
  previousPhase: 'idle',
  currentPhase: 'idle',
}

/**
 * Compute the diff between two steps to highlight changes
 * Only works for JS Runtime steps - returns empty diff for DSA steps
 */
export function computeStepDiff(
  previous: ExecutionStep | null,
  current: ExecutionStep
): StepDiff {
  // Only compute diff for JS Runtime steps
  if (!isJSRuntimeStep(current)) {
    return EMPTY_DIFF
  }

  const changes: StepChange[] = []

  // Default empty state for comparison
  const prev: Pick<JSRuntimeStep, 'callStack' | 'microtaskQueue' | 'macrotaskQueue' | 'webApiTimers' | 'consoleOutput' | 'phase'> =
    (previous && isJSRuntimeStep(previous))
      ? previous
      : {
          callStack: [],
          microtaskQueue: [],
          macrotaskQueue: [],
          webApiTimers: [],
          consoleOutput: [],
          phase: 'idle' as EventLoopPhase,
        }

  // Call Stack changes
  const prevStackIds = new Set(prev.callStack.map((f: StackFrame) => f.id))
  const currStackIds = new Set(current.callStack.map((f: StackFrame) => f.id))

  const addedToCallStack = current.callStack.filter((f: StackFrame) => !prevStackIds.has(f.id))
  const removedFromCallStack = prev.callStack.filter((f: StackFrame) => !currStackIds.has(f.id))

  for (const frame of addedToCallStack) {
    changes.push({
      type: 'call-stack-push',
      itemId: frame.id,
      description: `Pushed "${frame.name}" to call stack`,
    })
  }

  for (const frame of removedFromCallStack) {
    changes.push({
      type: 'call-stack-pop',
      itemId: frame.id,
      description: `Popped "${frame.name}" from call stack`,
    })
  }

  // Microtask changes
  const prevMicrotaskIds = new Set(prev.microtaskQueue.map((t: MicrotaskItem) => t.id))
  const currMicrotaskIds = new Set(current.microtaskQueue.map((t: MicrotaskItem) => t.id))

  const addedMicrotasks = current.microtaskQueue.filter((t: MicrotaskItem) => !prevMicrotaskIds.has(t.id))
  const removedMicrotasks = prev.microtaskQueue.filter((t: MicrotaskItem) => !currMicrotaskIds.has(t.id))

  for (const task of addedMicrotasks) {
    changes.push({
      type: 'microtask-add',
      itemId: task.id,
      description: `Added microtask: ${task.label}`,
    })
  }

  for (const task of removedMicrotasks) {
    changes.push({
      type: 'microtask-remove',
      itemId: task.id,
      description: `Executed microtask: ${task.label}`,
    })
  }

  // Macrotask changes
  const prevMacrotaskIds = new Set(prev.macrotaskQueue.map((t: MacrotaskItem) => t.id))
  const currMacrotaskIds = new Set(current.macrotaskQueue.map((t: MacrotaskItem) => t.id))

  const addedMacrotasks = current.macrotaskQueue.filter((t: MacrotaskItem) => !prevMacrotaskIds.has(t.id))
  const removedMacrotasks = prev.macrotaskQueue.filter((t: MacrotaskItem) => !currMacrotaskIds.has(t.id))

  for (const task of addedMacrotasks) {
    changes.push({
      type: 'macrotask-add',
      itemId: task.id,
      description: `Added macrotask: ${task.label}`,
    })
  }

  for (const task of removedMacrotasks) {
    changes.push({
      type: 'macrotask-remove',
      itemId: task.id,
      description: `Executed macrotask: ${task.label}`,
    })
  }

  // Timer changes
  const prevTimerIds = new Set(prev.webApiTimers.map((t: WebApiTimer) => t.id))
  const currTimerIds = new Set(current.webApiTimers.map((t: WebApiTimer) => t.id))

  const addedTimers = current.webApiTimers.filter((t: WebApiTimer) => !prevTimerIds.has(t.id))
  const removedTimers = prev.webApiTimers.filter((t: WebApiTimer) => !currTimerIds.has(t.id))

  for (const timer of addedTimers) {
    changes.push({
      type: 'timer-add',
      itemId: timer.id,
      description: `Timer registered: ${timer.label}`,
    })
  }

  for (const timer of removedTimers) {
    changes.push({
      type: 'timer-remove',
      itemId: timer.id,
      description: `Timer completed: ${timer.label}`,
    })
  }

  // Console changes
  const prevConsoleIds = new Set(prev.consoleOutput.map((c: ConsoleOutput) => c.id))
  const addedConsole = current.consoleOutput.filter((c: ConsoleOutput) => !prevConsoleIds.has(c.id))

  for (const entry of addedConsole) {
    changes.push({
      type: 'console-add',
      itemId: entry.id,
      description: `Console output: "${entry.value}"`,
    })
  }

  // Phase change
  const phaseChanged = prev.phase !== current.phase

  if (phaseChanged) {
    changes.push({
      type: 'phase-change',
      description: `Phase changed: ${prev.phase} → ${current.phase}`,
    })
  }

  return {
    changes,
    addedToCallStack,
    removedFromCallStack,
    addedMicrotasks,
    removedMicrotasks,
    addedMacrotasks,
    removedMacrotasks,
    addedTimers,
    removedTimers,
    addedConsole,
    phaseChanged,
    previousPhase: prev.phase as string,
    currentPhase: current.phase,
  }
}

/**
 * Create initial controller state
 */
export function createInitialControllerState(): ControllerState {
  return {
    status: 'idle',
    steps: [],
    currentStepIndex: -1,
    diff: null,
    error: null,
  }
}

/**
 * Get the current step from state (helper)
 */
export function getCurrentStep(state: ControllerState): ExecutionStep | null {
  if (state.currentStepIndex < 0 || state.currentStepIndex >= state.steps.length) {
    return null
  }
  return state.steps[state.currentStepIndex]
}

/**
 * Check if we can step forward
 */
export function canStepForward(state: ControllerState): boolean {
  return (
    state.status !== 'idle' &&
    state.status !== 'error' &&
    state.currentStepIndex < state.steps.length - 1
  )
}

/**
 * Check if we can step backward
 */
export function canStepBackward(state: ControllerState): boolean {
  return state.status !== 'idle' && state.currentStepIndex > 0
}

/**
 * Check if we can play
 */
export function canPlay(state: ControllerState): boolean {
  return (
    (state.status === 'ready' || state.status === 'paused') &&
    state.currentStepIndex < state.steps.length - 1
  )
}

/**
 * Get progress percentage
 */
export function getProgress(state: ControllerState): number {
  if (state.steps.length === 0) return 0
  return Math.round(((state.currentStepIndex + 1) / state.steps.length) * 100)
}
