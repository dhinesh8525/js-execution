/**
 * EventLoopEngine - Accurate JavaScript Event Loop Simulation
 *
 * This engine simulates the JavaScript event loop with correct semantics:
 *
 * 1. Execute all synchronous code (call stack must be empty)
 * 2. Drain ALL microtasks (including ones added during microtask execution)
 * 3. Execute ONE macrotask
 * 4. Go to step 2 (check microtasks again)
 * 5. Repeat until all queues are empty
 *
 * Key insight: Microtasks are ALWAYS fully drained before ANY macrotask runs.
 * If a microtask schedules another microtask, that new one runs BEFORE
 * any macrotask, even if the macrotask was scheduled first.
 */

import { CodeAnalyzer } from './CodeAnalyzer'
import {
  DEFAULT_CONFIG,
  type JSRuntimeStep,
  type StepType,
  type EventLoopPhase,
  type StackFrame,
  type MicrotaskItem,
  type MacrotaskItem,
  type WebApiTimer,
  type ConsoleOutput,
  type ParsedOperation,
  type EventLoopEngineConfig,
  type LineHighlight,
  type VisualConnection,
} from './types'

// Internal state during simulation
interface SimulationState {
  callStack: StackFrame[]
  microtaskQueue: MicrotaskItem[]
  macrotaskQueue: MacrotaskItem[]
  webApiTimers: WebApiTimer[]
  consoleOutput: ConsoleOutput[]
  virtualTime: number
  idCounter: number
  /** Currently executing task ID (for tracking parent-child relationships) */
  currentExecutingTaskId: string | null
  /** Active connections for the current step */
  activeConnections: VisualConnection[]
}

export class EventLoopEngine {
  private config: EventLoopEngineConfig
  private analyzer: CodeAnalyzer
  private steps: JSRuntimeStep[] = []
  private state: SimulationState = this.createInitialState()

  constructor(config: Partial<EventLoopEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.analyzer = new CodeAnalyzer()
  }

  /**
   * Simulate execution of JavaScript code and return all steps
   */
  simulate(code: string): JSRuntimeStep[] {
    // Reset state
    this.steps = []
    this.state = this.createInitialState()

    // Parse the code
    const parsed = this.analyzer.analyze(code)
    if (!parsed.success) {
      this.addStep('sync-start', 'sync', 0, 'Parse error', parsed.errors?.[0]?.message)
      return this.steps
    }

    // Phase 1: Execute synchronous code
    this.addStep(
      'sync-start',
      'sync',
      1,
      'Starting synchronous execution',
      'JavaScript begins by executing all synchronous code. The call stack starts with the global execution context.'
    )

    // Push global frame
    this.state.callStack.push({
      id: 'global',
      name: 'Global',
      type: 'sync',
      line: 1,
    })

    // Execute all top-level operations synchronously
    for (const op of parsed.operations) {
      this.executeSyncOperation(op)

      // Safety: prevent infinite loops
      if (this.steps.length >= (this.config.maxSteps ?? 1000)) {
        this.addStep('sync-complete', 'sync', 0, 'Max steps reached', 'Simulation stopped to prevent infinite loop.')
        return this.steps
      }
    }

    // Pop global frame
    this.state.callStack = []

    this.addStep(
      'sync-complete',
      'sync',
      0,
      'Synchronous code complete',
      'All synchronous code has finished. The call stack is now empty. Time to check the microtask queue!'
    )

    // Phase 2 & 3: Event loop
    this.runEventLoop()

    // Complete
    this.addStep(
      'event-loop-complete',
      'idle',
      0,
      'Execution complete',
      'All queues are empty. The event loop has nothing more to process.'
    )

    return this.steps
  }

  /**
   * The main event loop simulation
   *
   * CRITICAL: This implements the correct event loop semantics:
   * - Microtasks drain COMPLETELY (including newly added ones)
   * - Only ONE macrotask runs per iteration
   * - After each macrotask, microtasks are checked again
   */
  private runEventLoop(): void {
    let iterations = 0
    const maxIterations = this.config.maxSteps ?? 1000

    while (iterations++ < maxIterations) {
      // Step 1: Process all pending timers that have completed
      this.processCompletedTimers()

      // Step 2: Drain ALL microtasks (this is the key insight!)
      const hadMicrotasks = this.drainMicrotaskQueue()

      // Step 3: If we have macrotasks, run exactly ONE
      if (this.state.macrotaskQueue.length > 0) {
        this.runOneMacrotask()
        // After macrotask, loop back to check microtasks again
        continue
      }

      // Step 4: If there are pending timers, advance time
      if (this.state.webApiTimers.length > 0) {
        this.advanceTimeToNextTimer()
        continue
      }

      // Nothing left to do
      if (this.state.microtaskQueue.length === 0 && this.state.macrotaskQueue.length === 0) {
        break
      }
    }
  }

  /**
   * Drain the ENTIRE microtask queue, including microtasks added during execution
   *
   * This is where most visualizers get it wrong. They check the queue once.
   * The correct behavior is to keep running until the queue is EMPTY.
   */
  private drainMicrotaskQueue(): boolean {
    if (this.state.microtaskQueue.length === 0) {
      return false
    }

    this.addStep(
      'event-loop-check-microtasks',
      'microtask',
      0,
      `Checking microtask queue (${this.state.microtaskQueue.length} tasks)`,
      'The event loop checks for microtasks. ALL microtasks must complete before any macrotask runs - even microtasks added during this phase!'
    )

    // Keep draining until empty - this handles microtasks that schedule more microtasks
    while (this.state.microtaskQueue.length > 0) {
      const task = this.state.microtaskQueue.shift()!

      // Create visual connection: microtask queue → callstack
      this.addConnection({
        id: `conn-${task.id}-execute`,
        sourceComponent: 'microtask',
        targetComponent: 'callstack',
        sourceItemId: task.id,
        targetItemId: task.id,
        sourceLine: task.scheduledAtLine,
        connectionType: 'execute',
        isActive: true,
        label: 'execute',
      })

      // Push to call stack
      this.state.callStack.push({
        id: task.id,
        name: task.label,
        type: 'microtask',
        line: task.scheduledAtLine,
        parentTaskId: task.parentTaskId,
      })

      // Track current executing task for child scheduling
      const previousTaskId = this.state.currentExecutingTaskId
      this.state.currentExecutingTaskId = task.id

      this.addStep(
        'event-loop-run-microtask',
        'microtask',
        task.scheduledAtLine,
        `Running microtask: ${task.label}`,
        `Executing microtask callback. Type: ${task.type}. ${
          this.state.microtaskQueue.length > 0
            ? `${this.state.microtaskQueue.length} more microtasks waiting.`
            : 'This is the last microtask.'
        }`,
        task.label
      )

      this.clearActiveConnections()

      // Execute the microtask callback (simplified - executes the callback operations)
      // In a real implementation, this would run the actual callback code
      this.executeMicrotaskCallback(task)

      // Restore previous task context
      this.state.currentExecutingTaskId = previousTaskId

      // Pop from call stack
      this.state.callStack.pop()

      // Safety check
      if (this.steps.length >= (this.config.maxSteps ?? 1000)) {
        break
      }
    }

    this.addStep(
      'event-loop-microtasks-empty',
      'microtask',
      0,
      'Microtask queue empty',
      'All microtasks have been processed. Now we can check the macrotask queue.'
    )

    return true
  }

  /**
   * Run exactly ONE macrotask
   *
   * Important: After running a macrotask, control returns to the event loop
   * which will check microtasks AGAIN before running another macrotask.
   */
  private runOneMacrotask(): void {
    this.addStep(
      'event-loop-check-macrotasks',
      'macrotask',
      0,
      `Checking macrotask queue (${this.state.macrotaskQueue.length} tasks)`,
      'The event loop picks ONE macrotask to execute. After this macrotask completes, microtasks will be checked again before the next macrotask.'
    )

    const task = this.state.macrotaskQueue.shift()!

    // Create visual connection: macrotask queue → callstack
    this.addConnection({
      id: `conn-${task.id}-execute`,
      sourceComponent: 'macrotask',
      targetComponent: 'callstack',
      sourceItemId: task.id,
      targetItemId: task.id,
      sourceLine: task.scheduledAtLine,
      connectionType: 'execute',
      isActive: true,
      label: 'execute',
    })

    // Push to call stack
    this.state.callStack.push({
      id: task.id,
      name: task.label,
      type: 'macrotask',
      line: task.scheduledAtLine,
      parentTaskId: task.parentTaskId,
    })

    // Track current executing task for child scheduling
    const previousTaskId = this.state.currentExecutingTaskId
    this.state.currentExecutingTaskId = task.id

    this.addStep(
      'event-loop-run-macrotask',
      'macrotask',
      task.scheduledAtLine,
      `Running macrotask: ${task.label}`,
      `Executing the callback from ${task.type}. After this completes, the event loop will check for microtasks before running any other macrotask.`,
      task.label
    )

    this.clearActiveConnections()

    // Execute the macrotask callback
    this.executeMacrotaskCallback(task)

    // Restore previous task context
    this.state.currentExecutingTaskId = previousTaskId

    // Pop from call stack
    this.state.callStack.pop()
  }

  /**
   * Execute a synchronous operation
   */
  private executeSyncOperation(op: ParsedOperation): void {
    switch (op.type) {
      case 'console-log':
        this.executeConsoleLog(op)
        break

      case 'setTimeout':
        this.executeSetTimeout(op)
        break

      case 'setInterval':
        this.executeSetInterval(op)
        break

      case 'promise-resolve-then':
        this.executePromiseResolveThen(op)
        break

      case 'promise-then':
        this.executePromiseThen(op)
        break

      case 'queueMicrotask':
        this.executeQueueMicrotask(op)
        break

      case 'variable-declaration':
        this.executeVariableDeclaration(op)
        break

      case 'function-declaration':
      case 'async-function':
        // Function declarations don't execute, they just define
        this.addStep(
          'sync-execute',
          'sync',
          op.line,
          `Declaring function: ${op.details.name}`,
          'Function declarations are hoisted and stored in memory.',
          'DECLARE'
        )
        break

      case 'function-call':
        this.executeFunctionCall(op)
        break

      default:
        // Generic expression
        this.addStep(
          'sync-execute',
          'sync',
          op.line,
          `Executing: ${op.code.slice(0, 50)}${op.code.length > 50 ? '...' : ''}`,
          undefined,
          'EXECUTE'
        )
    }
  }

  private executeConsoleLog(op: ParsedOperation): void {
    const value = String(op.details.value ?? '')

    this.addStep(
      'sync-execute',
      'sync',
      op.line,
      `Executing console.log('${value}')`,
      'console.log is a synchronous operation. It executes immediately and outputs to the console.',
      'EXECUTE'
    )

    this.state.consoleOutput.push({
      id: this.generateId(),
      type: 'log',
      value,
      line: op.line,
      timestamp: this.state.virtualTime,
    })

    this.addStep('console-output', 'sync', op.line, `Output: "${value}"`, undefined)
  }

  private executeSetTimeout(op: ParsedOperation): void {
    const delay = Number(op.details.delay ?? 0)
    const callbackCode = String(op.details.callbackCode ?? '')
    const timerId = this.generateId()

    this.addStep(
      'sync-execute',
      'sync',
      op.line,
      `Executing setTimeout(..., ${delay})`,
      `setTimeout is called synchronously, but it registers a callback to run later. The callback will be added to the macrotask queue after ${delay}ms.`,
      'EXECUTE'
    )

    // Add to Web APIs (browser manages the timer)
    const timer: WebApiTimer = {
      id: timerId,
      type: 'setTimeout',
      label: `setTimeout (${delay}ms)`,
      delay,
      startedAt: this.state.virtualTime,
      completesAt: this.state.virtualTime + delay,
      remaining: delay,
      callbackCode,
      scheduledAtLine: op.line,
      parentTaskId: this.state.currentExecutingTaskId ?? 'global',
    }
    this.state.webApiTimers.push(timer)

    // Create visual connection: code → webapi
    this.addConnection({
      id: `conn-${timerId}-schedule`,
      sourceComponent: 'code',
      targetComponent: 'webapi',
      sourceItemId: `line-${op.line}`,
      targetItemId: timerId,
      sourceLine: op.line,
      connectionType: 'schedule',
      isActive: true,
      label: `${delay}ms`,
    })

    this.addStep(
      'timer-register',
      'sync',
      op.line,
      `Timer registered in Web APIs (${delay}ms)`,
      `The browser's Web APIs will track this timer. When it completes, the callback will be pushed to the macrotask queue.`
    )

    // Clear the connection after showing it
    this.clearActiveConnections()

    // Store the callback operations for later
    ;(timer as any)._callbackOps = op.children
  }

  private executeSetInterval(op: ParsedOperation): void {
    const delay = Number(op.details.delay ?? 0)
    const timerId = this.generateId()

    this.addStep(
      'sync-execute',
      'sync',
      op.line,
      `Executing setInterval(..., ${delay})`,
      `setInterval registers a callback that fires repeatedly every ${delay}ms.`,
      'EXECUTE'
    )

    // Note: For simplicity, we'll only simulate the first interval callback
    const timer: WebApiTimer = {
      id: timerId,
      type: 'setInterval',
      label: `setInterval (${delay}ms)`,
      delay,
      startedAt: this.state.virtualTime,
      completesAt: this.state.virtualTime + delay,
      remaining: delay,
      callbackCode: String(op.details.callbackCode ?? ''),
      scheduledAtLine: op.line,
    }
    this.state.webApiTimers.push(timer)
    ;(timer as any)._callbackOps = op.children

    this.addStep('timer-register', 'sync', op.line, `Interval timer registered in Web APIs (${delay}ms)`, undefined)
  }

  private executePromiseResolveThen(op: ParsedOperation): void {
    const callbackCode = String(op.details.callbackCode ?? '')
    const microtaskId = this.generateId()

    this.addStep(
      'sync-execute',
      'sync',
      op.line,
      `Executing Promise.resolve().then(...)`,
      'Promise.resolve() creates an already-resolved promise. The .then() callback is immediately scheduled as a microtask.',
      'EXECUTE'
    )

    // Promise.resolve().then() immediately queues a microtask
    const microtask: MicrotaskItem = {
      id: microtaskId,
      type: 'promise-then',
      label: '.then() callback',
      callbackCode,
      scheduledAtLine: op.line,
      resolvedValue: op.details.resolvedValue,
      parentTaskId: this.state.currentExecutingTaskId ?? 'global',
    }
    this.state.microtaskQueue.push(microtask)
    ;(microtask as any)._callbackOps = op.children

    // Create visual connection: code → microtask queue
    this.addConnection({
      id: `conn-${microtaskId}-schedule`,
      sourceComponent: 'code',
      targetComponent: 'microtask',
      sourceItemId: `line-${op.line}`,
      targetItemId: microtaskId,
      sourceLine: op.line,
      connectionType: 'schedule',
      isActive: true,
      label: 'then()',
    })

    this.addStep(
      'schedule-microtask',
      'sync',
      op.line,
      `Microtask scheduled: .then() callback`,
      'The .then() callback is added to the microtask queue. It will run after all synchronous code completes, but BEFORE any macrotasks.'
    )

    this.clearActiveConnections()
  }

  private executePromiseThen(op: ParsedOperation): void {
    const callbackCode = String(op.details.callbackCode ?? '')

    // Handle chained .then()
    const chainedFrom = op.details.chainedFrom as ParsedOperation | undefined
    if (chainedFrom) {
      // First execute the inner operation
      this.executeSyncOperation(chainedFrom)
    }

    // Then schedule this .then() as a microtask
    const microtask: MicrotaskItem = {
      id: this.generateId(),
      type: 'promise-then',
      label: '.then() callback',
      callbackCode,
      scheduledAtLine: op.line,
    }
    this.state.microtaskQueue.push(microtask)
    ;(microtask as any)._callbackOps = op.children

    this.addStep(
      'schedule-microtask',
      'sync',
      op.line,
      `Microtask scheduled: .then() callback`,
      'Chained .then() callbacks execute in order. Each runs as a separate microtask.'
    )
  }

  private executeQueueMicrotask(op: ParsedOperation): void {
    const callbackCode = String(op.details.callbackCode ?? '')
    const microtaskId = this.generateId()

    this.addStep(
      'sync-execute',
      'sync',
      op.line,
      `Executing queueMicrotask(...)`,
      'queueMicrotask() directly adds a callback to the microtask queue.',
      'EXECUTE'
    )

    const microtask: MicrotaskItem = {
      id: microtaskId,
      type: 'queueMicrotask',
      label: 'queueMicrotask callback',
      callbackCode,
      scheduledAtLine: op.line,
      parentTaskId: this.state.currentExecutingTaskId ?? 'global',
    }
    this.state.microtaskQueue.push(microtask)
    ;(microtask as any)._callbackOps = op.children

    // Create visual connection: code → microtask queue
    this.addConnection({
      id: `conn-${microtaskId}-schedule`,
      sourceComponent: 'code',
      targetComponent: 'microtask',
      sourceItemId: `line-${op.line}`,
      targetItemId: microtaskId,
      sourceLine: op.line,
      connectionType: 'schedule',
      isActive: true,
      label: 'queue',
    })

    this.addStep(
      'schedule-microtask',
      'sync',
      op.line,
      `Microtask scheduled: queueMicrotask callback`,
      'The callback is now in the microtask queue.'
    )

    this.clearActiveConnections()
  }

  private executeVariableDeclaration(op: ParsedOperation): void {
    const kind = op.details.kind
    const declarations = op.details.declarations as any[]

    for (const decl of declarations) {
      this.addStep(
        'sync-execute',
        'sync',
        op.line,
        `Declaring ${kind} ${decl.name}${decl.init ? ` = ${decl.init}` : ''}`,
        undefined,
        'DECLARE'
      )

      // If the initializer contains an async operation, execute it
      if (decl.initOp) {
        this.executeSyncOperation(decl.initOp)
      }
    }
  }

  private executeFunctionCall(op: ParsedOperation): void {
    const funcName = op.details.functionName

    this.addStep(
      'sync-execute',
      'sync',
      op.line,
      `Calling function: ${funcName}()`,
      'Function calls execute synchronously unless they contain async operations.',
      'CALL'
    )
  }

  /**
   * Execute the callback of a microtask
   */
  private executeMicrotaskCallback(task: MicrotaskItem): void {
    const callbackOps = (task as any)._callbackOps as ParsedOperation[] | undefined

    if (callbackOps) {
      for (const op of callbackOps) {
        this.executeSyncOperation(op)
      }
    }
  }

  /**
   * Execute the callback of a macrotask
   */
  private executeMacrotaskCallback(task: MacrotaskItem): void {
    const callbackOps = (task as any)._callbackOps as ParsedOperation[] | undefined

    if (callbackOps) {
      for (const op of callbackOps) {
        this.executeSyncOperation(op)
      }
    }
  }

  /**
   * Process timers that have completed and move them to macrotask queue
   */
  private processCompletedTimers(): void {
    const completedTimers = this.state.webApiTimers.filter((t) => t.completesAt <= this.state.virtualTime)

    for (const timer of completedTimers) {
      // Remove from web APIs
      this.state.webApiTimers = this.state.webApiTimers.filter((t) => t.id !== timer.id)

      // Create visual connection: webapi → macrotask queue
      this.addConnection({
        id: `conn-${timer.id}-complete`,
        sourceComponent: 'webapi',
        targetComponent: 'macrotask',
        sourceItemId: timer.id,
        targetItemId: timer.id,
        sourceLine: timer.scheduledAtLine,
        connectionType: 'complete',
        isActive: true,
        label: 'complete',
      })

      this.addStep(
        'timer-complete',
        'sync',
        timer.scheduledAtLine,
        `Timer complete: ${timer.label}`,
        `The ${timer.delay}ms timer has finished. Its callback is now moved to the macrotask queue.`
      )

      // Add to macrotask queue
      const macrotask: MacrotaskItem = {
        id: timer.id,
        type: timer.type,
        label: timer.label + ' callback',
        callbackCode: timer.callbackCode,
        scheduledAtLine: timer.scheduledAtLine,
        delay: timer.delay,
        executeAt: timer.completesAt,
        parentTaskId: timer.parentTaskId,
        timerId: timer.id,
      }
      ;(macrotask as any)._callbackOps = (timer as any)._callbackOps

      this.state.macrotaskQueue.push(macrotask)

      this.addStep(
        'schedule-macrotask',
        'sync',
        timer.scheduledAtLine,
        `Macrotask queued: ${timer.label} callback`,
        'The callback is now in the macrotask queue, waiting for its turn in the event loop.'
      )

      this.clearActiveConnections()
    }
  }

  /**
   * Advance virtual time to the next timer completion
   */
  private advanceTimeToNextTimer(): void {
    if (this.state.webApiTimers.length === 0) return

    // Find the timer that completes soonest
    const nextTimer = this.state.webApiTimers.reduce((earliest, timer) =>
      timer.completesAt < earliest.completesAt ? timer : earliest
    )

    // Update remaining time for all timers
    const elapsed = nextTimer.completesAt - this.state.virtualTime
    for (const timer of this.state.webApiTimers) {
      timer.remaining = Math.max(0, timer.remaining - elapsed)
    }

    this.state.virtualTime = nextTimer.completesAt
  }

  /**
   * Create a new step and add it to the steps array
   */
  private addStep(
    type: StepType,
    phase: EventLoopPhase,
    currentLine: number | null,
    description: string,
    explanation?: string,
    lineLabel?: string,
    scheduledFromLine?: number | null
  ): void {
    // Build highlights array
    const highlights: LineHighlight[] = []

    // Primary highlight: current executing line
    if (currentLine && currentLine > 0) {
      highlights.push({
        line: currentLine,
        type: 'executing',
        label: lineLabel || 'EXECUTING',
        className: 'highlight-executing',
      })
    }

    // Secondary highlight: where this async task was scheduled (for callbacks)
    if (scheduledFromLine && scheduledFromLine > 0 && scheduledFromLine !== currentLine) {
      highlights.push({
        line: scheduledFromLine,
        type: 'scheduled-from',
        label: 'SCHEDULED HERE',
        className: 'highlight-scheduled',
      })
    }

    // Add highlights for tasks that are about to execute
    if (type === 'event-loop-check-microtasks' && this.state.microtaskQueue.length > 0) {
      const nextTask = this.state.microtaskQueue[0]
      if (nextTask.scheduledAtLine && nextTask.scheduledAtLine > 0) {
        highlights.push({
          line: nextTask.scheduledAtLine,
          type: 'will-execute',
          label: 'NEXT',
          className: 'highlight-next',
        })
      }
    }

    if (type === 'event-loop-check-macrotasks' && this.state.macrotaskQueue.length > 0) {
      const nextTask = this.state.macrotaskQueue[0]
      if (nextTask.scheduledAtLine && nextTask.scheduledAtLine > 0) {
        highlights.push({
          line: nextTask.scheduledAtLine,
          type: 'will-execute',
          label: 'NEXT',
          className: 'highlight-next',
        })
      }
    }

    const step: JSRuntimeStep = {
      index: this.steps.length,
      mode: 'JS_RUNTIME',
      type,
      phase,
      description,
      explanation: this.config.includeExplanations ? explanation : undefined,
      currentLine: currentLine || null,
      lineLabel,
      scheduledFromLine: scheduledFromLine || null,
      highlights,
      // Deep copy state to create immutable snapshots
      callStack: JSON.parse(JSON.stringify(this.state.callStack)),
      microtaskQueue: JSON.parse(JSON.stringify(this.state.microtaskQueue)),
      macrotaskQueue: JSON.parse(JSON.stringify(this.state.macrotaskQueue)),
      webApiTimers: JSON.parse(JSON.stringify(this.state.webApiTimers)),
      consoleOutput: JSON.parse(JSON.stringify(this.state.consoleOutput)),
      virtualTime: this.state.virtualTime,
      // Copy active connections for this step
      connections: [...this.state.activeConnections],
    }

    this.steps.push(step)
  }

  private createInitialState(): SimulationState {
    return {
      callStack: [],
      microtaskQueue: [],
      macrotaskQueue: [],
      webApiTimers: [],
      consoleOutput: [],
      virtualTime: 0,
      idCounter: 0,
      currentExecutingTaskId: null,
      activeConnections: [],
    }
  }

  private generateId(): string {
    return `${++this.state.idCounter}`
  }

  /**
   * Add a visual connection to the active connections list
   */
  private addConnection(connection: VisualConnection): void {
    this.state.activeConnections.push(connection)
  }

  /**
   * Clear all active connections (called after step that shows them)
   */
  private clearActiveConnections(): void {
    this.state.activeConnections = []
  }
}

// Convenience function for simple usage
export function simulateEventLoopV2(code: string): JSRuntimeStep[] {
  const engine = new EventLoopEngine()
  return engine.simulate(code)
}
