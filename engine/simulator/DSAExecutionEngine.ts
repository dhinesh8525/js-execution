/**
 * DSAExecutionEngine - Algorithm Visualization Engine
 *
 * This engine simulates algorithm execution with step-by-step visualization:
 * - Array operations (access, swap, compare)
 * - Recursion tracking (call tree, return values)
 * - Variable state tracking
 * - Algorithm-specific metrics (comparisons, swaps, depth)
 *
 * Works by instrumenting code to capture trace events, then converting
 * those events into visualization steps.
 */

import {
  type DSAExecutionStep,
  type DSAStepType,
  type AlgorithmType,
  type ArrayState,
  type VariableState,
  type RecursionFrame,
  type TreeNodeState,
  type GraphState,
  type DPTableState,
  type ConsoleOutput,
  type LineHighlight,
} from './types'

// ============================================================================
// Trace Event Types (Internal)
// ============================================================================

type TraceEventType =
  | 'start'
  | 'end'
  | 'array-init'
  | 'array-access'
  | 'array-set'
  | 'array-swap'
  | 'array-compare'
  | 'variable-set'
  | 'function-call'
  | 'function-return'
  | 'loop-start'
  | 'loop-iteration'
  | 'loop-end'
  | 'condition'
  | 'console-log'

interface TraceEvent {
  type: TraceEventType
  line: number
  data: Record<string, unknown>
  timestamp: number
}

// ============================================================================
// Configuration
// ============================================================================

export interface DSAEngineConfig {
  maxSteps?: number
  includeExplanations?: boolean
  algorithmType?: AlgorithmType
}

const DEFAULT_DSA_CONFIG: DSAEngineConfig = {
  maxSteps: 1000,
  includeExplanations: true,
  algorithmType: 'GENERIC',
}

// ============================================================================
// DSA Execution Engine
// ============================================================================

export class DSAExecutionEngine {
  private config: DSAEngineConfig
  private steps: DSAExecutionStep[] = []
  private traceEvents: TraceEvent[] = []

  // Current state
  private arrays: Map<string, ArrayState> = new Map()
  private variables: Map<string, VariableState> = new Map()
  private recursionStack: RecursionFrame[] = []
  private consoleOutput: ConsoleOutput[] = []

  // Metrics
  private comparisons = 0
  private swaps = 0
  private maxRecursionDepth = 0

  // ID generation
  private idCounter = 0

  constructor(config: Partial<DSAEngineConfig> = {}) {
    this.config = { ...DEFAULT_DSA_CONFIG, ...config }
  }

  /**
   * Simulate algorithm execution and return visualization steps
   */
  simulate(code: string, algorithmType?: AlgorithmType): DSAExecutionStep[] {
    // Reset state
    this.reset()
    const algType = algorithmType ?? this.config.algorithmType ?? 'GENERIC'

    try {
      // Add start step
      this.addStep('algorithm-start', null, 'Algorithm execution started', 'Starting algorithm simulation. Each step will show the state of arrays, variables, and recursion.')

      // Execute and trace the code
      this.executeWithTracing(code)

      // Add completion step
      this.addStep('algorithm-complete', null, 'Algorithm complete', `Finished with ${this.comparisons} comparisons and ${this.swaps} swaps.`)
    } catch (error) {
      this.addStep(
        'algorithm-complete',
        null,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'An error occurred during execution.'
      )
    }

    return this.steps
  }

  /**
   * Reset engine state
   */
  private reset(): void {
    this.steps = []
    this.traceEvents = []
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
   * Execute code with tracing instrumentation
   */
  private executeWithTracing(code: string): void {
    // Create a sandboxed execution environment with trace functions
    const traceContext = this.createTraceContext()

    // Wrap the code with our tracing utilities
    const instrumentedCode = this.instrumentCode(code)

    try {
      // Execute in sandbox
      const fn = new Function(...Object.keys(traceContext), instrumentedCode)
      fn(...Object.values(traceContext))
    } catch (error) {
      // Re-throw with better error message
      throw new Error(`Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create trace context with helper functions
   */
  private createTraceContext(): Record<string, unknown> {
    const self = this

    // Helper to stringify values properly
    const stringify = (val: unknown): string => {
      if (val === null) return 'null'
      if (val === undefined) return 'undefined'
      if (Array.isArray(val)) return '[' + val.join(', ') + ']'
      if (typeof val === 'object') return JSON.stringify(val)
      return String(val)
    }

    return {
      // Array operations
      __traceArrayInit: (name: string, values: unknown[], line: number) => {
        self.handleArrayInit(name, values as (number | string | null)[], line)
      },
      __traceArrayAccess: (name: string, index: number, line: number) => {
        self.handleArrayAccess(name, index, line)
        const arr = self.arrays.get(name)
        return arr?.values[index]
      },
      __traceArraySet: (name: string, index: number, value: unknown, line: number) => {
        self.handleArraySet(name, index, value as number | string | null, line)
      },
      __traceArraySwap: (name: string, i: number, j: number, line: number) => {
        self.handleArraySwap(name, i, j, line)
      },
      __traceCompare: (left: unknown, right: unknown, line: number, leftName?: string, rightName?: string) => {
        self.handleCompare(left, right, line, leftName, rightName)
        const l = Number(left)
        const r = Number(right)
        return l < r ? -1 : l > r ? 1 : 0
      },

      // Variable operations
      __traceVarSet: (name: string, value: unknown, line: number) => {
        self.handleVariableSet(name, value, line)
      },

      // Function operations
      __traceFunctionCall: (name: string, args: Record<string, unknown>, line: number) => {
        self.handleFunctionCall(name, args, line)
      },
      __traceFunctionReturn: (name: string, value: unknown, line: number) => {
        self.handleFunctionReturn(name, value, line)
      },

      // Loop operations
      __traceLoopIter: (iterVar: string, value: number, line: number) => {
        self.handleLoopIteration(iterVar, value, line)
      },

      // Console - handles multiple arguments
      __traceConsole: (...args: unknown[]) => {
        // Last argument is the line number
        const line = typeof args[args.length - 1] === 'number' ? args.pop() as number : 0
        const value = args.map(stringify).join(' ')
        self.handleConsoleLog(value, line)
      },

      // Recursion simulation tracking
      __traceRecursionEnter: (funcName: string, args: string, line: number) => {
        self.handleRecursionEnter(funcName, args, line)
      },
      __traceRecursionExit: (funcName: string, line: number) => {
        self.handleRecursionExit(funcName, line)
      },

      // Standard console object
      console: {
        log: (...args: unknown[]) => {
          const value = args.map(stringify).join(' ')
          self.handleConsoleLog(value, 0)
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
    }
  }

  /**
   * Instrument code for tracing
   * This is a simplified version - a full implementation would use AST parsing
   */
  private instrumentCode(code: string): string {
    const lines = code.split('\n')
    const instrumentedLines: string[] = []

    // Track function names for recursion
    const functionNames: string[] = []
    const functionRegex = /function\s+(\w+)\s*\(/g
    let match
    while ((match = functionRegex.exec(code)) !== null) {
      if (!functionNames.includes(match[1])) {
        functionNames.push(match[1])
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNum = i + 1
      let instrumentedLine = line

      // Instrument array initialization: const arr = [...]
      const arrayInitMatch = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*\[(.*)\]/)
      if (arrayInitMatch) {
        const [, name, values] = arrayInitMatch
        instrumentedLine = `const ${name} = (function() { const __arr = [${values}]; __traceArrayInit("${name}", __arr, ${lineNum}); return __arr; })();`
      }

      // Instrument array swaps: [arr[i], arr[j]] = [arr[j], arr[i]] or [arr[0], arr[4]] = [arr[4], arr[0]]
      const swapMatch = line.match(/\[\s*(\w+)\[([^\]]+)\]\s*,\s*\1\[([^\]]+)\]\s*\]\s*=\s*\[\s*\1\[([^\]]+)\]\s*,\s*\1\[([^\]]+)\]\s*\]/)
      if (swapMatch) {
        const [fullMatch, arrName, i1, j1] = swapMatch
        instrumentedLine = line.replace(
          fullMatch,
          `(function() { __traceArraySwap("${arrName}", ${i1}, ${j1}, ${lineNum}); ${fullMatch}; })()`
        )
      }

      // Instrument temp-based swaps
      const tempSwapMatch = line.match(/(?:const|let|var)\s+temp\s*=\s*(\w+)\[(\w+)\]/)
      if (tempSwapMatch) {
        // Mark this as start of swap
        instrumentedLine = `${line} /* swap start */`
      }

      // Instrument variable declarations with simple values
      const varDeclMatch = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*([^;[\]{}]+);?$/)
      if (varDeclMatch && !arrayInitMatch) {
        const [, name, value] = varDeclMatch
        // Don't instrument function calls or complex expressions
        if (!/\(/.test(value) && !/\[/.test(value)) {
          instrumentedLine = `${line.trimEnd()}; __traceVarSet("${name}", ${name}, ${lineNum});`
        }
      }

      // Instrument variable reassignments (for tracking depth, etc.)
      const varReassignMatch = line.match(/^\s*(\w+)\s*=\s*(\d+)\s*;?\s*$/)
      if (varReassignMatch && !varDeclMatch) {
        const [, name, value] = varReassignMatch
        instrumentedLine = `${line.trimEnd()}; __traceVarSet("${name}", ${name}, ${lineNum});`
      }

      // Instrument function calls that we know are recursive
      for (let fi = 0; fi < functionNames.length; fi++) {
        const funcName = functionNames[fi]
        const callRegex = new RegExp(`\\b${funcName}\\s*\\(([^)]*)\\)`)
        if (callRegex.test(line) && !line.includes('function ')) {
          instrumentedLine = instrumentedLine.replace(
            callRegex,
            (matchStr) => `(function() { __traceFunctionCall("${funcName}", {}, ${lineNum}); const __r = ${matchStr}; __traceFunctionReturn("${funcName}", __r, ${lineNum}); return __r; })()`
          )
        }
      }

      // Instrument console.log - pass all arguments directly
      const consoleMatch = line.match(/console\.log\s*\((.+)\)\s*;?\s*$/)
      if (consoleMatch) {
        const [fullMatch, args] = consoleMatch
        instrumentedLine = line.replace(
          fullMatch,
          `__traceConsole(${args}, ${lineNum});`
        )
      }

      // Track recursion simulation via "CALL" and "RETURN" in console.log (AFTER console instrumentation)
      if (line.includes('console.log') && (line.includes('CALL') || line.includes('call') || line.includes('Call'))) {
        const funcMatch = line.match(/(?:CALL|call|Call)\s+(\w+)\s*\(([^)]*)\)/)
        if (funcMatch) {
          const [, funcName, funcArgs] = funcMatch
          instrumentedLine = `__traceRecursionEnter("${funcName}", "${funcArgs}", ${lineNum}); ${instrumentedLine}`
        }
      }

      if (line.includes('console.log') && (line.includes('RETURN') || line.includes('return') || line.includes('Return'))) {
        // Don't match JavaScript 'return' keyword, only RETURN in strings
        const returnMatch = line.match(/['"].*(?:RETURN|Return)\s+(\w+)/)
        if (returnMatch) {
          instrumentedLine = `${instrumentedLine} __traceRecursionExit("${returnMatch[1]}", ${lineNum});`
        }
      }

      // Instrument comparisons in if/while conditions
      const comparisonMatch = line.match(/if\s*\(\s*(\w+)\[(\w+)\]\s*([<>=!]+)\s*(\w+)\[(\w+)\]\s*\)/)
      if (comparisonMatch) {
        const [, arr1, idx1, op, arr2, idx2] = comparisonMatch
        instrumentedLine = line.replace(
          comparisonMatch[0],
          `if (__traceCompare(${arr1}[${idx1}], ${arr2}[${idx2}], ${lineNum}) ${op.includes('>') ? '>' : op.includes('<') ? '<' : '==='} 0)`
        )
      }

      instrumentedLines.push(instrumentedLine)
    }

    return instrumentedLines.join('\n')
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  private handleArrayInit(name: string, values: (number | string | null)[], line: number): void {
    const arrayState: ArrayState = {
      id: this.generateId(),
      name,
      values: [...values],
      comparing: [],
      swapping: [],
      sorted: [],
      accessing: [],
      pointers: {},
    }
    this.arrays.set(name, arrayState)

    this.addStep(
      'array-init',
      line,
      `Initialized array ${name} with ${values.length} elements`,
      `Array "${name}" = [${values.join(', ')}]`
    )
  }

  private handleArrayAccess(name: string, index: number, line: number): void {
    const arr = this.arrays.get(name)
    if (!arr) return

    // Update accessing state
    arr.accessing = [index]
    this.arrays.set(name, { ...arr })

    this.addStep(
      'array-access',
      line,
      `Accessing ${name}[${index}] = ${arr.values[index]}`,
      `Reading value at index ${index}`
    )

    // Clear accessing after the step
    arr.accessing = []
    this.arrays.set(name, { ...arr })
  }

  private handleArraySet(name: string, index: number, value: number | string | null, line: number): void {
    const arr = this.arrays.get(name)
    if (!arr) return

    const oldValue = arr.values[index]
    arr.values[index] = value

    this.addStep(
      'array-set',
      line,
      `Set ${name}[${index}] = ${value} (was ${oldValue})`,
      `Updating array element at index ${index}`
    )
  }

  private handleArraySwap(name: string, i: number, j: number, line: number): void {
    const arr = this.arrays.get(name)
    if (!arr) return

    // Show comparison/swap state
    arr.comparing = []
    arr.swapping = [i, j]
    this.arrays.set(name, { ...arr })

    // Perform the swap
    const temp = arr.values[i]
    arr.values[i] = arr.values[j]
    arr.values[j] = temp

    this.swaps++

    this.addStep(
      'array-swap',
      line,
      `Swapped ${name}[${i}]=${arr.values[j]} ↔ ${name}[${j}]=${arr.values[i]}`,
      `Swapping elements at indices ${i} and ${j}. Total swaps: ${this.swaps}`
    )

    // Clear swap highlight
    arr.swapping = []
    this.arrays.set(name, { ...arr })
  }

  private handleCompare(left: unknown, right: unknown, line: number, leftName?: string, rightName?: string): void {
    this.comparisons++

    const l = Number(left)
    const r = Number(right)
    const description = leftName && rightName
      ? `Comparing ${leftName}=${left} with ${rightName}=${right}`
      : `Comparing ${left} with ${right}`

    this.addStep(
      'array-compare',
      line,
      description,
      `Comparison #${this.comparisons}: ${left} ${l < r ? '<' : l > r ? '>' : '='} ${right}`
    )
  }

  private handleVariableSet(name: string, value: unknown, line: number): void {
    const existing = this.variables.get(name)
    const varState: VariableState = {
      name,
      value,
      type: this.getValueType(value),
      changed: true,
      previousValue: existing?.value,
    }
    this.variables.set(name, varState)

    const changeInfo = existing ? ` (was ${existing.value})` : ''
    this.addStep(
      'variable-update',
      line,
      `Set ${name} = ${JSON.stringify(value)}${changeInfo}`,
      `Variable "${name}" updated to ${JSON.stringify(value)}`
    )

    // Clear changed flag after step
    varState.changed = false
    this.variables.set(name, varState)
  }

  private handleFunctionCall(name: string, args: Record<string, unknown>, line: number): void {
    const depth = this.recursionStack.length
    const frame: RecursionFrame = {
      id: this.generateId(),
      functionName: name,
      args,
      depth,
      isActive: true,
      isComplete: false,
      parentId: this.recursionStack.length > 0 ? this.recursionStack[this.recursionStack.length - 1].id : null,
      callLine: line,
    }

    this.recursionStack.push(frame)
    this.maxRecursionDepth = Math.max(this.maxRecursionDepth, depth + 1)

    this.addStep(
      'recursion-call',
      line,
      `Calling ${name}(${Object.values(args).join(', ')})`,
      `Recursion depth: ${depth + 1}. Function call added to stack.`
    )
  }

  private handleFunctionReturn(name: string, value: unknown, line: number): void {
    const frame = this.recursionStack.pop()
    if (frame) {
      frame.returnValue = value
      frame.isActive = false
      frame.isComplete = true
    }

    const depth = this.recursionStack.length

    this.addStep(
      'recursion-return',
      line,
      `${name} returned ${JSON.stringify(value)}`,
      `Recursion depth now: ${depth}. Function removed from stack.`
    )
  }

  private handleLoopIteration(iterVar: string, value: number, line: number): void {
    this.handleVariableSet(iterVar, value, line)

    this.addStep(
      'loop-iteration',
      line,
      `Loop iteration: ${iterVar} = ${value}`,
      `Starting new iteration with ${iterVar} = ${value}`
    )
  }

  private handleConsoleLog(value: string, line: number): void {
    const output: ConsoleOutput = {
      id: this.generateId(),
      type: 'log',
      value,
      line,
      timestamp: Date.now(),
    }
    this.consoleOutput.push(output)

    this.addStep(
      'console-output',
      line,
      `Output: ${value}`,
      `Console output added`
    )
  }

  /**
   * Handle entering a recursive call (simulated via console.log patterns)
   */
  private handleRecursionEnter(funcName: string, args: string, line: number): void {
    const depth = this.recursionStack.length
    const frame: RecursionFrame = {
      id: this.generateId(),
      functionName: funcName,
      args: { input: args },
      depth,
      isActive: true,
      isComplete: false,
      parentId: this.recursionStack.length > 0 ? this.recursionStack[this.recursionStack.length - 1].id : null,
      callLine: line,
    }

    this.recursionStack.push(frame)
    this.maxRecursionDepth = Math.max(this.maxRecursionDepth, depth + 1)

    this.addStep(
      'recursion-call',
      line,
      `Call ${funcName}(${args})`,
      `Recursion depth: ${depth + 1}. Max depth so far: ${this.maxRecursionDepth}`
    )
  }

  /**
   * Handle returning from a recursive call (simulated via console.log patterns)
   */
  private handleRecursionExit(funcName: string, line: number): void {
    const frame = this.recursionStack.pop()
    if (frame) {
      frame.isActive = false
      frame.isComplete = true
    }

    const depth = this.recursionStack.length

    this.addStep(
      'recursion-return',
      line,
      `Return from ${funcName}`,
      `Recursion depth now: ${depth}`
    )
  }

  // ============================================================================
  // Step Generation
  // ============================================================================

  private addStep(
    type: DSAStepType,
    currentLine: number | null,
    description: string,
    explanation?: string
  ): void {
    // Build highlights
    const highlights: LineHighlight[] = []
    if (currentLine && currentLine > 0) {
      highlights.push({
        line: currentLine,
        type: 'executing',
        label: 'EXECUTING',
        className: 'highlight-executing',
      })
    }

    const step: DSAExecutionStep = {
      index: this.steps.length,
      mode: 'DSA',
      type,
      algorithmType: this.config.algorithmType ?? 'GENERIC',
      description,
      explanation: this.config.includeExplanations ? explanation : undefined,
      currentLine,
      highlights,

      // State snapshots (deep copy)
      arrays: this.getArraysSnapshot(),
      variables: this.getVariablesSnapshot(),
      recursionStack: JSON.parse(JSON.stringify(this.recursionStack)),
      treeState: null, // TODO: implement tree state
      graphState: null, // TODO: implement graph state
      dpTable: null, // TODO: implement DP table

      consoleOutput: JSON.parse(JSON.stringify(this.consoleOutput)),

      // Metrics
      comparisons: this.comparisons,
      swaps: this.swaps,
      recursionDepth: this.recursionStack.length,
    }

    this.steps.push(step)

    // Check max steps
    if (this.steps.length >= (this.config.maxSteps ?? 1000)) {
      throw new Error('Maximum steps reached')
    }
  }

  private getArraysSnapshot(): ArrayState[] {
    return Array.from(this.arrays.values()).map((arr) => ({
      ...arr,
      values: [...arr.values],
      comparing: [...arr.comparing],
      swapping: [...arr.swapping],
      sorted: [...arr.sorted],
      accessing: [...arr.accessing],
      pointers: { ...arr.pointers },
    }))
  }

  private getVariablesSnapshot(): VariableState[] {
    return Array.from(this.variables.values()).map((v) => ({ ...v }))
  }

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

  private generateId(): string {
    return `dsa-${++this.idCounter}`
  }
}

// Convenience function
export function simulateDSA(code: string, algorithmType?: AlgorithmType): DSAExecutionStep[] {
  const engine = new DSAExecutionEngine({ algorithmType })
  return engine.simulate(code, algorithmType)
}
