/**
 * Event Loop Simulator Types
 *
 * These types model the JavaScript runtime's event loop with enough
 * granularity to visualize each step of execution.
 *
 * Extended with DSA (Data Structures & Algorithms) visualization types
 * for dual-mode support.
 */

// ============================================================================
// Execution Mode (JS Runtime vs DSA)
// ============================================================================

export type ExecutionMode = 'JS_RUNTIME' | 'DSA'

export type AlgorithmType =
  | 'SORTING'
  | 'SEARCHING'
  | 'TREE_TRAVERSAL'
  | 'GRAPH_TRAVERSAL'
  | 'RECURSION'
  | 'DYNAMIC_PROGRAMMING'
  | 'LINKED_LIST'
  | 'STACK_QUEUE'
  | 'GENERIC'

// ============================================================================
// DSA Step Types
// ============================================================================

export type DSAStepType =
  // Array operations
  | 'array-init'
  | 'array-access'
  | 'array-swap'
  | 'array-compare'
  | 'array-set'
  // Recursion
  | 'recursion-call'
  | 'recursion-return'
  | 'recursion-base-case'
  // Tree operations
  | 'tree-visit'
  | 'tree-insert'
  | 'tree-delete'
  // Graph operations
  | 'graph-visit'
  | 'graph-edge'
  | 'graph-mark-visited'
  // DP operations
  | 'dp-init'
  | 'dp-compute'
  | 'dp-lookup'
  // Generic
  | 'pointer-move'
  | 'variable-update'
  | 'function-call'
  | 'function-return'
  | 'loop-iteration'
  | 'condition-check'
  | 'algorithm-start'
  | 'algorithm-complete'
  | 'console-output'

// ============================================================================
// DSA State Types
// ============================================================================

export interface ArrayState {
  id: string
  name: string
  values: (number | string | null)[]
  /** Indices currently being compared */
  comparing: number[]
  /** Indices that were just swapped */
  swapping: number[]
  /** Indices that are sorted/finalized */
  sorted: number[]
  /** Indices currently being accessed */
  accessing: number[]
  /** Pointer positions (e.g., { left: 0, right: 5, mid: 2 }) */
  pointers: Record<string, number>
}

export interface VariableState {
  name: string
  value: unknown
  type: 'number' | 'string' | 'boolean' | 'array' | 'object' | 'null' | 'undefined'
  /** Whether this variable changed in the current step */
  changed: boolean
  /** Previous value (for showing delta) */
  previousValue?: unknown
}

export interface RecursionFrame {
  id: string
  functionName: string
  args: Record<string, unknown>
  /** Depth in the recursion tree */
  depth: number
  /** Return value if function has returned */
  returnValue?: unknown
  /** Whether this frame is currently active */
  isActive: boolean
  /** Whether this frame has completed */
  isComplete: boolean
  /** Parent frame ID for tree structure */
  parentId: string | null
  /** Line number where the function was called */
  callLine: number
}

export interface TreeNodeState {
  id: string
  value: unknown
  left: TreeNodeState | null
  right: TreeNodeState | null
  /** Whether this node is currently being visited */
  isVisiting: boolean
  /** Whether this node has been visited */
  isVisited: boolean
  /** Highlight color for visualization */
  highlight?: 'current' | 'visited' | 'target' | 'found'
}

export interface GraphNodeState {
  id: string
  value: unknown
  x?: number
  y?: number
  isVisiting: boolean
  isVisited: boolean
  highlight?: 'current' | 'visited' | 'queued' | 'target'
}

export interface GraphEdgeState {
  source: string
  target: string
  weight?: number
  isActive: boolean
  isVisited: boolean
}

export interface GraphState {
  nodes: GraphNodeState[]
  edges: GraphEdgeState[]
  directed: boolean
}

export interface DPCell {
  row: number
  col: number
  value: unknown
  isComputed: boolean
  isCurrentCell: boolean
  /** Dependencies for this cell (for drawing arrows) */
  dependsOn: Array<{ row: number; col: number }>
}

export interface DPTableState {
  rows: number
  cols: number
  cells: DPCell[][]
  rowLabels?: string[]
  colLabels?: string[]
}

// ============================================================================
// Task Relationships (Causality Tracking)
// ============================================================================

export type TaskType = 'sync' | 'microtask' | 'macrotask' | 'timer'

/**
 * Represents a causal relationship between tasks
 * e.g., "setTimeout on line 5 created timer_1 which will become macrotask_1"
 */
export interface TaskRelationship {
  id: string
  /** The task that created/scheduled this relationship */
  sourceTaskId: string
  /** The task that was created/scheduled */
  targetTaskId: string
  /** Type of relationship */
  type: 'schedules' | 'spawns' | 'continues' | 'completes-to'
  /** Line where the scheduling happened */
  sourceLine: number
  /** Line where the target will execute (if known) */
  targetLine?: number
  /** Visual connection status */
  status: 'pending' | 'active' | 'completed'
  /** Task types for styling */
  sourceType: TaskType
  targetType: TaskType
}

/**
 * Visual connection for rendering arrows
 */
export interface VisualConnection {
  id: string
  /** Source component: 'code', 'callstack', 'webapi', 'microtask', 'macrotask' */
  sourceComponent: 'code' | 'callstack' | 'webapi' | 'microtask' | 'macrotask'
  /** Target component */
  targetComponent: 'code' | 'callstack' | 'webapi' | 'microtask' | 'macrotask'
  /** Source item ID within the component */
  sourceItemId: string
  /** Target item ID within the component */
  targetItemId: string
  /** Line number for code connections */
  sourceLine?: number
  targetLine?: number
  /** Connection type for styling */
  connectionType: 'schedule' | 'execute' | 'complete' | 'move'
  /** Is this connection currently active/animating */
  isActive: boolean
  /** Label to show on the connection */
  label?: string
}

// ============================================================================
// Core Queue Items
// ============================================================================

export interface StackFrame {
  id: string
  name: string
  type: 'sync' | 'microtask' | 'macrotask'
  /** Line number in original source */
  line: number
  /** Column number in original source */
  column?: number
  /** ID of the task that created this frame (for causality) */
  parentTaskId?: string
}

export interface MicrotaskItem {
  id: string
  type: 'promise-then' | 'promise-catch' | 'promise-finally' | 'queueMicrotask' | 'await-resume'
  /** Human-readable label */
  label: string
  /** The callback code (for display) */
  callbackCode: string
  /** Line where this microtask was scheduled */
  scheduledAtLine: number
  /** Column where this microtask was scheduled */
  scheduledAtColumn?: number
  /** Optional: value being passed to the callback */
  resolvedValue?: unknown
  /** ID of the task that scheduled this microtask (for causality) */
  parentTaskId?: string
  /** ID of the scheduling operation (e.g., the Promise.then call) */
  scheduledById?: string
}

export interface MacrotaskItem {
  id: string
  type: 'setTimeout' | 'setInterval' | 'setImmediate' | 'requestAnimationFrame' | 'I/O'
  /** Human-readable label */
  label: string
  /** The callback code (for display) */
  callbackCode: string
  /** Line where this macrotask was scheduled */
  scheduledAtLine: number
  /** Column where this macrotask was scheduled */
  scheduledAtColumn?: number
  /** Delay in milliseconds (for timers) */
  delay: number
  /** Virtual time when this task should execute */
  executeAt: number
  /** ID of the task that scheduled this macrotask (for causality) */
  parentTaskId?: string
  /** ID of the timer in Web APIs (for tracking) */
  timerId?: string
}

export interface WebApiTimer {
  id: string
  type: 'setTimeout' | 'setInterval'
  label: string
  delay: number
  /** Virtual time when timer started */
  startedAt: number
  /** Virtual time when timer completes */
  completesAt: number
  /** Remaining time (for visualization) */
  remaining: number
  callbackCode: string
  scheduledAtLine: number
  /** ID of the task that created this timer (for causality) */
  parentTaskId?: string
}

export interface ConsoleOutput {
  id: string
  type: 'log' | 'warn' | 'error' | 'info'
  value: string
  line: number
  timestamp: number
}

// ============================================================================
// Execution Step (Snapshot of state at a point in time)
// ============================================================================

export type StepType =
  // Synchronous execution
  | 'sync-start'
  | 'sync-execute'
  | 'sync-complete'
  // Call stack operations
  | 'call-stack-push'
  | 'call-stack-pop'
  // Async scheduling
  | 'schedule-microtask'
  | 'schedule-macrotask'
  | 'timer-register'
  | 'timer-complete'
  // Event loop phases
  | 'event-loop-check-microtasks'
  | 'event-loop-run-microtask'
  | 'event-loop-microtasks-empty'
  | 'event-loop-check-macrotasks'
  | 'event-loop-run-macrotask'
  | 'event-loop-complete'
  // Console
  | 'console-output'

export type EventLoopPhase =
  | 'sync'           // Executing synchronous code
  | 'microtask'      // Draining microtask queue
  | 'macrotask'      // Executing a macrotask
  | 'idle'           // Nothing to do

/**
 * Line highlight information for code editor synchronization
 */
export interface LineHighlight {
  /** Line number (1-indexed) */
  line: number
  /** Column number (0-indexed) */
  column?: number
  /** Type of highlight */
  type: 'executing' | 'scheduled-from' | 'will-execute'
  /** Label to display */
  label?: string
  /** Additional CSS class */
  className?: string
}

/**
 * JS Runtime Execution Step (Event Loop visualization)
 */
export interface JSRuntimeStep {
  /** Unique step index */
  index: number
  /** Discriminator for union type */
  mode: 'JS_RUNTIME'
  /** Type of this step */
  type: StepType
  /** Current event loop phase */
  phase: EventLoopPhase
  /** Human-readable description of what's happening */
  description: string
  /** Detailed explanation for learning */
  explanation?: string
  /** Line being executed (for highlighting) - primary */
  currentLine: number | null
  /** Label to show on the highlighted line */
  lineLabel?: string
  /** Line where the current async task was originally scheduled */
  scheduledFromLine?: number | null
  /** All line highlights for this step */
  highlights: LineHighlight[]

  // State snapshots (immutable copies)
  callStack: StackFrame[]
  microtaskQueue: MicrotaskItem[]
  macrotaskQueue: MacrotaskItem[]
  webApiTimers: WebApiTimer[]
  consoleOutput: ConsoleOutput[]

  /** Virtual time in ms */
  virtualTime: number

  /** Visual connections for rendering arrows between components */
  connections: VisualConnection[]
}

/**
 * DSA Execution Step (Algorithm visualization)
 */
export interface DSAExecutionStep {
  /** Unique step index */
  index: number
  /** Discriminator for union type */
  mode: 'DSA'
  /** Type of this step */
  type: DSAStepType
  /** Algorithm type being visualized */
  algorithmType: AlgorithmType
  /** Human-readable description of what's happening */
  description: string
  /** Detailed explanation for learning */
  explanation?: string
  /** Line being executed (for highlighting) - primary */
  currentLine: number | null
  /** All line highlights for this step */
  highlights: LineHighlight[]

  // DSA-specific state snapshots
  /** Array states (multiple arrays can be tracked) */
  arrays: ArrayState[]
  /** Variable states */
  variables: VariableState[]
  /** Recursion call stack (for tracking recursive calls) */
  recursionStack: RecursionFrame[]
  /** Tree structure state (for tree algorithms) */
  treeState: TreeNodeState | null
  /** Graph structure state (for graph algorithms) */
  graphState: GraphState | null
  /** DP table state (for dynamic programming) */
  dpTable: DPTableState | null
  /** Console output */
  consoleOutput: ConsoleOutput[]

  // Metrics
  /** Number of comparisons made so far */
  comparisons: number
  /** Number of swaps made so far */
  swaps: number
  /** Current recursion depth */
  recursionDepth: number
}

/**
 * Unified Execution Step - can be either JS Runtime or DSA mode
 */
export type ExecutionStep = JSRuntimeStep | DSAExecutionStep

/**
 * Type guard to check if step is JS Runtime mode
 */
export function isJSRuntimeStep(step: ExecutionStep): step is JSRuntimeStep {
  return step.mode === 'JS_RUNTIME'
}

/**
 * Type guard to check if step is DSA mode
 */
export function isDSAStep(step: ExecutionStep): step is DSAExecutionStep {
  return step.mode === 'DSA'
}

/**
 * Legacy ExecutionStep type for backward compatibility
 * @deprecated Use JSRuntimeStep instead
 */
export type LegacyExecutionStep = Omit<JSRuntimeStep, 'mode'>

// ============================================================================
// Parsed Code Structures
// ============================================================================

export interface ParsedOperation {
  id: string
  type:
    | 'console-log'
    | 'setTimeout'
    | 'setInterval'
    | 'promise-resolve-then'
    | 'promise-then'
    | 'promise-catch'
    | 'queueMicrotask'
    | 'async-function'
    | 'await-expression'
    | 'function-call'
    | 'function-declaration'
    | 'variable-declaration'
    | 'expression'
  line: number
  column: number
  /** Raw code for this operation */
  code: string
  /** Parsed details specific to operation type */
  details: Record<string, unknown>
  /** Child operations (e.g., callback body) */
  children?: ParsedOperation[]
}

export interface ParsedCode {
  success: boolean
  operations: ParsedOperation[]
  errors?: Array<{ message: string; line: number }>
}

// ============================================================================
// Engine Configuration
// ============================================================================

export interface EventLoopEngineConfig {
  /** Maximum number of steps to generate (prevent infinite loops) */
  maxSteps?: number
  /** Maximum virtual time in ms */
  maxTime?: number
  /** Whether to include detailed explanations */
  includeExplanations?: boolean
}

export const DEFAULT_CONFIG: EventLoopEngineConfig = {
  maxSteps: 1000,
  maxTime: 60000,
  includeExplanations: true,
}

// ============================================================================
// Timeline Events (for timeline visualization)
// ============================================================================

export type TimelinePhaseType = 'sync' | 'microtask-drain' | 'macrotask-execute' | 'idle'

export interface TimelineEvent {
  id: string
  /** Phase type for styling */
  phase: TimelinePhaseType
  /** Human-readable label */
  label: string
  /** Starting step index */
  startStep: number
  /** Ending step index */
  endStep: number
  /** Duration in steps */
  duration: number
  /** Tasks executed in this phase */
  taskCount: number
  /** Description of what happened */
  description: string
}
