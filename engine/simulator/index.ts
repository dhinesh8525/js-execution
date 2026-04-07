/**
 * Event Loop Simulator - Public API
 *
 * Provides accurate JavaScript event loop simulation with step-by-step
 * execution support for visualization.
 *
 * Now with dual-mode support:
 * - JS_RUNTIME: Event loop visualization (setTimeout, Promise, etc.)
 * - DSA: Algorithm visualization (sorting, searching, recursion)
 */

// JS Runtime Engine (Event Loop)
export { EventLoopEngine, simulateEventLoopV2 } from './EventLoopEngine'
export { CodeAnalyzer } from './CodeAnalyzer'
export { generateTimeline, getPhaseColor, getPhaseBgColor } from './TimelineGenerator'

// DSA Engine (Algorithms)
export { DSAExecutionEngine, simulateDSA, type DSAEngineConfig } from './DSAExecutionEngine'

// Trace-based DSA Engine (Real Algorithms)
export {
  TraceExecutionEngine,
  simulateWithTrace,
  type TraceEngineConfig,
  type TraceEvent,
  type TraceCategory,
  type TraceAction,
} from './TraceExecutionEngine'

// Execution Controller (state machine)
export {
  controllerReducer,
  computeStepDiff,
  createInitialControllerState,
  getCurrentStep,
  canStepForward,
  canStepBackward,
  canPlay,
  getProgress,
  type ControllerState,
  type ControllerAction,
  type StepDiff,
  type StepChange,
  type ChangeType,
} from './ExecutionController'

// Types
export type {
  // Execution modes
  ExecutionMode,
  AlgorithmType,
  // Step types
  ExecutionStep,
  JSRuntimeStep,
  DSAExecutionStep,
  StepType,
  DSAStepType,
  EventLoopPhase,
  // JS Runtime types
  StackFrame,
  MicrotaskItem,
  MacrotaskItem,
  WebApiTimer,
  ConsoleOutput,
  // DSA types
  ArrayState,
  VariableState,
  RecursionFrame,
  TreeNodeState,
  GraphNodeState,
  GraphEdgeState,
  GraphState,
  DPCell,
  DPTableState,
  // Parsed code types
  ParsedOperation,
  ParsedCode,
  EventLoopEngineConfig,
  LineHighlight,
  VisualConnection,
  TaskRelationship,
  TaskType,
  TimelineEvent,
  TimelinePhaseType,
  LegacyExecutionStep,
} from './types'

export { DEFAULT_CONFIG, isJSRuntimeStep, isDSAStep } from './types'

// Legacy V1 simulator (for backward compatibility)
export { simulateEventLoop } from './eventLoopSimulator'
