/**
 * TraceExecutionEngine - Executes real algorithms with trace instrumentation
 *
 * This engine:
 * 1. Injects a trace() function into the execution context
 * 2. Collects all trace events during execution
 * 3. Converts trace events to visualization steps
 *
 * TRACE EVENT FORMAT:
 * {
 *   category: 'ARRAY' | 'STACK' | 'QUEUE' | 'TREE' | 'GRAPH' | 'RECURSION' | 'DP',
 *   action: string,
 *   payload: { indices?, values?, message?, ... },
 *   snapshot: { array?, variables?, callStack?, pointers? }
 * }
 */

import {
  type DSAExecutionStep,
  type DSAStepType,
  type AlgorithmType,
  type ArrayState,
  type VariableState,
  type RecursionFrame,
  type ConsoleOutput,
  type LineHighlight,
} from './types'

// =============================================================================
// Trace Event Types
// =============================================================================

export type TraceCategory = 'ARRAY' | 'STACK' | 'QUEUE' | 'TREE' | 'GRAPH' | 'RECURSION' | 'DP'

export type TraceAction =
  | 'INIT' | 'COMPLETE'
  | 'COMPARE' | 'SWAP' | 'ACCESS' | 'SET' | 'SHIFT' | 'INSERT'
  | 'SORTED' | 'PASS_START' | 'PASS_COMPLETE' | 'EARLY_EXIT'
  | 'PARTITION_START' | 'PARTITION_DONE' | 'UPDATE_MIN' | 'SELECT_KEY'
  | 'DIVIDE' | 'MERGE_START' | 'MERGE_DONE'
  | 'CALCULATE_MID' | 'SEARCH_LEFT' | 'SEARCH_RIGHT' | 'FOUND' | 'NOT_FOUND'
  | 'CALL' | 'RETURN' | 'BASE_CASE' | 'RECURSE'
  | 'VISIT' | 'SKIP' | 'EXPLORE_NEIGHBORS' | 'CHECK_NEIGHBOR' | 'LEVEL_START'
  | 'START_TRAVERSAL' | 'TRAVERSAL_COMPLETE'
  | 'PUSH' | 'POP' | 'PEEK' | 'AFTER_PUSH' | 'AFTER_POP'
  | 'ENQUEUE' | 'DEQUEUE' | 'FRONT' | 'AFTER_ENQUEUE' | 'AFTER_DEQUEUE'
  | 'CHOICE' | 'BACKTRACK' | 'OUTPUT' | 'TRY' | 'PLACE' | 'CONFLICT'
  | 'ERROR'

export interface TraceEvent {
  step: number
  category: TraceCategory
  action: TraceAction
  payload: {
    indices?: number[]
    values?: unknown[]
    value?: unknown
    index?: number
    message?: string
    function?: string
    args?: Record<string, unknown>
    result?: unknown
    node?: unknown
    [key: string]: unknown
  }
  snapshot: {
    array?: unknown[]
    variables?: Record<string, unknown>
    callStack?: string[]
    pointers?: Record<string, number>
    stack?: unknown[]
    queue?: unknown[]
    tree?: unknown
    graph?: unknown
  }
}

// =============================================================================
// Engine Configuration
// =============================================================================

export interface TraceEngineConfig {
  maxSteps?: number
  includeExplanations?: boolean
  algorithmType?: AlgorithmType
}

const DEFAULT_CONFIG: TraceEngineConfig = {
  maxSteps: 1000,
  includeExplanations: true,
  algorithmType: 'GENERIC',
}

// =============================================================================
// Trace Execution Engine
// =============================================================================

export class TraceExecutionEngine {
  private config: TraceEngineConfig
  private traceEvents: TraceEvent[] = []
  private stepCounter = 0

  // State tracking
  private arrays: Map<string, ArrayState> = new Map()
  private variables: Map<string, VariableState> = new Map()
  private recursionStack: RecursionFrame[] = []
  private consoleOutput: ConsoleOutput[] = []

  // Metrics
  private comparisons = 0
  private swaps = 0
  private maxRecursionDepth = 0

  private idCounter = 0

  constructor(config: Partial<TraceEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Execute algorithm code and return visualization steps
   */
  simulate(code: string, algorithmType?: AlgorithmType): DSAExecutionStep[] {
    this.reset()
    const algType = algorithmType ?? this.config.algorithmType ?? 'GENERIC'

    try {
      // Execute code with trace function injected
      this.executeWithTrace(code)

      // Convert trace events to DSA steps
      return this.convertToSteps(algType)
    } catch (error) {
      // Return error step
      return [{
        index: 0,
        mode: 'DSA',
        type: 'algorithm-complete',
        algorithmType: algType,
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'An error occurred during execution.',
        currentLine: null,
        highlights: [],
        arrays: [],
        variables: [],
        recursionStack: [],
        treeState: null,
        graphState: null,
        dpTable: null,
        consoleOutput: [],
        comparisons: 0,
        swaps: 0,
        recursionDepth: 0,
      }]
    }
  }

  /**
   * Reset engine state
   */
  private reset(): void {
    this.traceEvents = []
    this.stepCounter = 0
    this.arrays = new Map()
    this.variables = new Map()
    this.recursionStack = []
    this.consoleOutput = []
    this.comparisons = 0
    this.swaps = 0
    this.maxRecursionDepth = 0
    this.idCounter = 0
  }

  /**
   * Execute code with trace function injected
   */
  private executeWithTrace(code: string): void {
    const self = this

    // Create trace function
    const trace = (event: Omit<TraceEvent, 'step'>) => {
      if (self.stepCounter >= (self.config.maxSteps ?? 1000)) {
        throw new Error('Maximum steps reached')
      }

      const traceEvent: TraceEvent = {
        step: self.stepCounter++,
        ...event,
      }

      self.traceEvents.push(traceEvent)
      self.updateState(traceEvent)
    }

    // Create execution context
    const context = {
      trace,
      console: {
        log: (...args: unknown[]) => {
          const message = args.map(a =>
            typeof a === 'object' ? JSON.stringify(a) : String(a)
          ).join(' ')

          self.consoleOutput.push({
            id: `console-${self.idCounter++}`,
            type: 'log',
            value: message,
            line: 0,
            timestamp: Date.now(),
          })
        },
      },
      Math,
      Array,
      Object,
      JSON,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      Infinity,
      NaN,
      Number,
      String,
      Boolean,
      Set,
      Map,
    }

    // Execute code
    const fn = new Function(...Object.keys(context), code)
    fn(...Object.values(context))
  }

  /**
   * Update internal state based on trace event
   */
  private updateState(event: TraceEvent): void {
    const { category, action, payload, snapshot } = event

    // Update arrays from snapshot
    if (snapshot.array) {
      const arrayState: ArrayState = {
        id: 'arr',
        name: 'arr',
        values: snapshot.array as (number | string | null)[],
        comparing: action === 'COMPARE' ? (payload.indices ?? []) : [],
        swapping: action === 'SWAP' ? (payload.indices ?? []) : [],
        sorted: [],
        accessing: action === 'ACCESS' ? [payload.index ?? 0] : [],
        pointers: snapshot.pointers ?? {},
      }
      this.arrays.set('arr', arrayState)
    }

    // Update variables from snapshot
    if (snapshot.variables) {
      for (const [name, value] of Object.entries(snapshot.variables)) {
        const existing = this.variables.get(name)
        this.variables.set(name, {
          name,
          value,
          type: this.getValueType(value),
          changed: existing?.value !== value,
          previousValue: existing?.value,
        })
      }
    }

    // Track recursion
    if (category === 'RECURSION' || category === 'TREE' || category === 'GRAPH') {
      if (action === 'CALL') {
        const frame: RecursionFrame = {
          id: `frame-${this.idCounter++}`,
          functionName: payload.function ?? 'unknown',
          args: payload.args ?? {},
          depth: this.recursionStack.length,
          isActive: true,
          isComplete: false,
          parentId: this.recursionStack.length > 0
            ? this.recursionStack[this.recursionStack.length - 1].id
            : null,
          callLine: 0,
        }
        this.recursionStack.push(frame)
        this.maxRecursionDepth = Math.max(this.maxRecursionDepth, this.recursionStack.length)
      } else if (action === 'RETURN' || action === 'BASE_CASE') {
        const frame = this.recursionStack.pop()
        if (frame) {
          frame.isActive = false
          frame.isComplete = true
          frame.returnValue = payload.value ?? payload.result
        }
      }
    }

    // Track metrics
    if (action === 'COMPARE') {
      this.comparisons++
    }
    if (action === 'SWAP') {
      this.swaps++
    }

    // Update stack/queue from snapshot
    if (snapshot.stack) {
      const stackState: ArrayState = {
        id: 'stack',
        name: 'stack',
        values: snapshot.stack as (number | string | null)[],
        comparing: [],
        swapping: [],
        sorted: [],
        accessing: [],
        pointers: {},
      }
      this.arrays.set('stack', stackState)
    }

    if (snapshot.queue) {
      const queueState: ArrayState = {
        id: 'queue',
        name: 'queue',
        values: snapshot.queue as (number | string | null)[],
        comparing: [],
        swapping: [],
        sorted: [],
        accessing: [],
        pointers: {},
      }
      this.arrays.set('queue', queueState)
    }
  }

  /**
   * Convert trace events to DSA execution steps
   */
  private convertToSteps(algorithmType: AlgorithmType): DSAExecutionStep[] {
    const steps: DSAExecutionStep[] = []

    // Reset state for replay
    this.arrays = new Map()
    this.variables = new Map()
    this.recursionStack = []
    this.comparisons = 0
    this.swaps = 0

    for (const event of this.traceEvents) {
      // Update state
      this.updateStateForStep(event)

      // Map trace action to DSA step type
      const stepType = this.mapActionToStepType(event.category, event.action)

      // Create step
      const step: DSAExecutionStep = {
        index: steps.length,
        mode: 'DSA',
        type: stepType,
        algorithmType,
        description: event.payload.message ?? this.generateDescription(event),
        explanation: this.config.includeExplanations
          ? this.generateExplanation(event)
          : undefined,
        currentLine: null,
        highlights: this.generateHighlights(event),
        arrays: this.getArraysSnapshot(),
        variables: this.getVariablesSnapshot(),
        recursionStack: [...this.recursionStack],
        treeState: null,
        graphState: null,
        dpTable: null,
        consoleOutput: [...this.consoleOutput],
        comparisons: this.comparisons,
        swaps: this.swaps,
        recursionDepth: this.recursionStack.length,
      }

      steps.push(step)
    }

    return steps
  }

  /**
   * Update state for step conversion (replay)
   */
  private updateStateForStep(event: TraceEvent): void {
    const { category, action, payload, snapshot } = event

    // Update arrays
    if (snapshot.array) {
      const existingArray = this.arrays.get('arr')
      const arrayState: ArrayState = {
        id: 'arr',
        name: 'arr',
        values: snapshot.array as (number | string | null)[],
        comparing: action === 'COMPARE' ? (payload.indices ?? []) : [],
        swapping: action === 'SWAP' ? (payload.indices ?? []) : [],
        sorted: existingArray?.sorted ?? [],
        accessing: action === 'ACCESS' || action === 'SET' ? [payload.index ?? 0] : [],
        pointers: snapshot.pointers ?? {},
      }

      // Mark sorted elements
      if (action === 'SORTED' && payload.index !== undefined) {
        arrayState.sorted = [...(existingArray?.sorted ?? []), payload.index]
      }

      this.arrays.set('arr', arrayState)
    }

    // Update variables
    if (snapshot.variables) {
      for (const [name, value] of Object.entries(snapshot.variables)) {
        const existing = this.variables.get(name)
        this.variables.set(name, {
          name,
          value,
          type: this.getValueType(value),
          changed: existing?.value !== value,
          previousValue: existing?.value,
        })
      }
    }

    // Track recursion stack
    if (category === 'RECURSION' || category === 'TREE' || category === 'GRAPH') {
      if (action === 'CALL') {
        const frame: RecursionFrame = {
          id: `frame-${this.idCounter++}`,
          functionName: payload.function ?? 'unknown',
          args: payload.args ?? {},
          depth: this.recursionStack.length,
          isActive: true,
          isComplete: false,
          parentId: this.recursionStack.length > 0
            ? this.recursionStack[this.recursionStack.length - 1].id
            : null,
          callLine: 0,
        }
        this.recursionStack.push(frame)
      } else if (action === 'RETURN' || action === 'BASE_CASE') {
        this.recursionStack.pop()
      }
    }

    // Track metrics
    if (action === 'COMPARE') this.comparisons++
    if (action === 'SWAP') this.swaps++

    // Stack/Queue
    if (snapshot.stack) {
      this.arrays.set('stack', {
        id: 'stack',
        name: 'stack',
        values: snapshot.stack as (number | string | null)[],
        comparing: [],
        swapping: [],
        sorted: [],
        accessing: action === 'PUSH' || action === 'POP' ? [snapshot.stack.length - 1] : [],
        pointers: { top: snapshot.stack.length - 1 },
      })
    }

    if (snapshot.queue) {
      this.arrays.set('queue', {
        id: 'queue',
        name: 'queue',
        values: snapshot.queue as (number | string | null)[],
        comparing: [],
        swapping: [],
        sorted: [],
        accessing: action === 'ENQUEUE' ? [snapshot.queue.length - 1] : action === 'DEQUEUE' ? [0] : [],
        pointers: { front: 0, rear: snapshot.queue.length - 1 },
      })
    }
  }

  /**
   * Map trace action to DSA step type
   */
  private mapActionToStepType(category: TraceCategory, action: TraceAction): DSAStepType {
    switch (action) {
      case 'INIT':
        return 'algorithm-start'
      case 'COMPLETE':
        return 'algorithm-complete'
      case 'COMPARE':
        return 'array-compare'
      case 'SWAP':
        return 'array-swap'
      case 'ACCESS':
      case 'SET':
        return 'array-access'
      case 'CALL':
        return 'recursion-call'
      case 'RETURN':
        return 'recursion-return'
      case 'BASE_CASE':
        return 'recursion-base-case'
      case 'VISIT':
        return category === 'TREE' ? 'tree-visit' : 'graph-visit'
      case 'PUSH':
      case 'POP':
      case 'ENQUEUE':
      case 'DEQUEUE':
        return 'variable-update'
      default:
        return 'variable-update'
    }
  }

  /**
   * Generate description from trace event
   */
  private generateDescription(event: TraceEvent): string {
    const { category, action, payload } = event

    switch (action) {
      case 'COMPARE':
        return `Compare ${payload.values?.[0]} with ${payload.values?.[1]}`
      case 'SWAP':
        return `Swap indices ${payload.indices?.[0]} and ${payload.indices?.[1]}`
      case 'CALL':
        return `Call ${payload.function}(${JSON.stringify(payload.args)})`
      case 'RETURN':
        return `Return ${payload.value}`
      case 'VISIT':
        return `Visit ${category === 'TREE' ? 'node' : 'vertex'} ${payload.node ?? payload.value}`
      default:
        return payload.message ?? `${category}: ${action}`
    }
  }

  /**
   * Generate explanation from trace event
   */
  private generateExplanation(event: TraceEvent): string {
    const { category, action, payload } = event

    switch (action) {
      case 'COMPARE':
        return `Comparing elements to determine ordering. Total comparisons: ${this.comparisons + 1}`
      case 'SWAP':
        return `Exchanging elements to move them toward sorted position. Total swaps: ${this.swaps + 1}`
      case 'CALL':
        return `Recursive call to ${payload.function}. Current depth: ${this.recursionStack.length + 1}`
      case 'RETURN':
        return `Returning from function. Depth: ${this.recursionStack.length}`
      case 'BASE_CASE':
        return `Base case reached - no more recursion needed.`
      default:
        return payload.message ?? ''
    }
  }

  /**
   * Generate highlights from trace event
   */
  private generateHighlights(event: TraceEvent): LineHighlight[] {
    return []
  }

  /**
   * Get snapshot of all arrays
   */
  private getArraysSnapshot(): ArrayState[] {
    return Array.from(this.arrays.values()).map(arr => ({
      ...arr,
      values: [...arr.values],
      comparing: [...arr.comparing],
      swapping: [...arr.swapping],
      sorted: [...arr.sorted],
      accessing: [...arr.accessing],
      pointers: { ...arr.pointers },
    }))
  }

  /**
   * Get snapshot of all variables
   */
  private getVariablesSnapshot(): VariableState[] {
    return Array.from(this.variables.values()).map(v => ({ ...v }))
  }

  /**
   * Get value type for variable
   */
  private getValueType(value: unknown): VariableState['type'] {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'object') return 'object'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') return 'string'
    if (typeof value === 'boolean') return 'boolean'
    return 'object'
  }
}

/**
 * Convenience function
 */
export function simulateWithTrace(code: string, algorithmType?: AlgorithmType): DSAExecutionStep[] {
  const engine = new TraceExecutionEngine({ algorithmType })
  return engine.simulate(code, algorithmType)
}
