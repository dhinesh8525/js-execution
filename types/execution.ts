export type ScopeType = 'global' | 'function' | 'block' | 'module'
export type ConsoleLevel = 'log' | 'warn' | 'error' | 'info' | 'debug'
export type AsyncType = 'timeout' | 'interval' | 'promise' | 'microtask' | 'animationFrame'
export type EventLoopPhase = 'call-stack' | 'microtask' | 'macrotask' | 'render'

export interface SourceLocation {
  line: number
  column: number
  start?: number
  end?: number
}

export interface Variable {
  name: string
  value: SerializedValue
  type: string
  declarationType: 'var' | 'let' | 'const' | 'param' | 'function'
}

export interface SerializedValue {
  type: 'primitive' | 'object' | 'array' | 'function' | 'undefined' | 'null' | 'symbol' | 'bigint'
  value: unknown
  preview?: string
  heapId?: string
  properties?: Record<string, SerializedValue>
  length?: number
  name?: string
}

export interface StackFrame {
  id: string
  name: string
  location: SourceLocation
  scopeId: string
  isAsync: boolean
  args?: SerializedValue[]
}

export interface Scope {
  id: string
  parentId: string | null
  type: ScopeType
  name: string
  variables: Map<string, Variable>
  location: SourceLocation
}

export interface HeapObject {
  id: string
  type: string
  value: unknown
  properties: Record<string, SerializedValue>
  prototype?: string
}

export interface AsyncTask {
  id: string
  type: AsyncType
  callback: string
  scheduledAt: number
  executeAt?: number
  status: 'pending' | 'executing' | 'completed'
}

export interface ConsoleEntry {
  id: string
  level: ConsoleLevel
  args: SerializedValue[]
  timestamp: number
  location: SourceLocation
}

// Trace Events - emitted during instrumented execution
export type TraceEvent =
  | DeclareEvent
  | AssignEvent
  | ReadEvent
  | FunctionCallEvent
  | FunctionReturnEvent
  | ScopeEnterEvent
  | ScopeExitEvent
  | ConsoleEvent
  | AsyncScheduleEvent
  | AsyncExecuteEvent
  | EventLoopTickEvent
  | ExpressionEvent
  | ErrorEvent

export interface BaseEvent {
  timestamp: number
  location: SourceLocation
}

export interface DeclareEvent extends BaseEvent {
  type: 'declare'
  name: string
  value: SerializedValue
  declarationType: 'var' | 'let' | 'const' | 'function' | 'class'
  scopeId: string
}

export interface AssignEvent extends BaseEvent {
  type: 'assign'
  name: string
  value: SerializedValue
  oldValue?: SerializedValue
  scopeId: string
}

export interface ReadEvent extends BaseEvent {
  type: 'read'
  name: string
  value: SerializedValue
  scopeId: string
}

export interface FunctionCallEvent extends BaseEvent {
  type: 'function_call'
  name: string
  args: SerializedValue[]
  callId: string
  isConstructor: boolean
  isMethod: boolean
}

export interface FunctionReturnEvent extends BaseEvent {
  type: 'function_return'
  name: string
  value: SerializedValue
  callId: string
}

export interface ScopeEnterEvent extends BaseEvent {
  type: 'scope_enter'
  scopeId: string
  parentScopeId: string | null
  scopeType: ScopeType
  name: string
}

export interface ScopeExitEvent extends BaseEvent {
  type: 'scope_exit'
  scopeId: string
}

export interface ConsoleEvent extends BaseEvent {
  type: 'console'
  level: ConsoleLevel
  args: SerializedValue[]
}

export interface AsyncScheduleEvent extends BaseEvent {
  type: 'async_schedule'
  asyncId: string
  asyncType: AsyncType
  delay?: number
}

export interface AsyncExecuteEvent extends BaseEvent {
  type: 'async_execute'
  asyncId: string
}

export interface EventLoopTickEvent extends BaseEvent {
  type: 'event_loop_tick'
  phase: EventLoopPhase
  queueLength: number
}

export interface ExpressionEvent extends BaseEvent {
  type: 'expression'
  expression: string
  value: SerializedValue
}

export interface ErrorEvent extends BaseEvent {
  type: 'error'
  message: string
  stack?: string
}

// Execution State at a point in time
export interface ExecutionSnapshot {
  stepIndex: number
  callStack: StackFrame[]
  scopes: Map<string, Scope>
  heap: Map<string, HeapObject>
  currentLine: number
  console: ConsoleEntry[]
  eventLoop: {
    phase: EventLoopPhase
    callbackQueue: AsyncTask[]
    microtaskQueue: AsyncTask[]
  }
}

// Result of parsing and instrumenting code
export interface InstrumentationResult {
  success: boolean
  instrumentedCode?: string
  sourceMap?: Record<number, number>
  errors?: Array<{
    message: string
    location: SourceLocation
  }>
}

// Result of code execution
export interface ExecutionResult {
  success: boolean
  events: TraceEvent[]
  console: ConsoleEntry[]
  error?: {
    message: string
    stack?: string
    location?: SourceLocation
  }
  duration: number
}
