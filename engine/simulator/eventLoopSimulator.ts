export interface SimulatorStep {
  type:
    | 'execute_line'
    | 'call_stack_push'
    | 'call_stack_pop'
    | 'add_to_web_api'
    | 'web_api_complete'
    | 'add_to_task_queue'
    | 'add_to_microtask_queue'
    | 'check_microtasks'
    | 'run_microtask'
    | 'check_task_queue'
    | 'run_task'
    | 'console_output'
    | 'event_loop_tick'
  line: number
  description: string
  details: Record<string, unknown>
  phase: 'sync' | 'microtask' | 'macrotask'
  callStack: CallStackItem[]
  webApis: WebApiItem[]
  taskQueue: QueueItem[]
  microtaskQueue: QueueItem[]
  consoleOutput: ConsoleOutputItem[]
  highlightedCode?: { line: number; label: string }
}

export interface CallStackItem {
  id: string
  name: string
  line: number
  isAsync?: boolean
}

export interface WebApiItem {
  id: string
  name: string
  callback: string
  delay: number
  startTime: number
  remaining: number
}

export interface QueueItem {
  id: string
  name: string
  callback: string
  line: number
}

export interface ConsoleOutputItem {
  value: string
  line: number
}

interface ParsedStatement {
  type: 'console.log' | 'setTimeout' | 'promise.then' | 'other'
  line: number
  value?: string
  delay?: number
  callbackValue?: string
}

export function simulateEventLoop(code: string): SimulatorStep[] {
  const steps: SimulatorStep[] = []
  const state = {
    callStack: [{ id: 'global', name: 'Global', line: 1 }] as CallStackItem[],
    webApis: [] as WebApiItem[],
    taskQueue: [] as QueueItem[],
    microtaskQueue: [] as QueueItem[],
    consoleOutput: [] as ConsoleOutputItem[],
    asyncIdCounter: 0,
  }

  // Parse code line by line to find statements
  const statements = parseCodeStatements(code)

  // Helper to create step snapshot
  const createStep = (
    type: SimulatorStep['type'],
    line: number,
    description: string,
    details: Record<string, unknown>,
    phase: SimulatorStep['phase'],
    highlightLabel?: string
  ): SimulatorStep => ({
    type,
    line,
    description,
    details,
    phase,
    callStack: JSON.parse(JSON.stringify(state.callStack)),
    webApis: JSON.parse(JSON.stringify(state.webApis)),
    taskQueue: JSON.parse(JSON.stringify(state.taskQueue)),
    microtaskQueue: JSON.parse(JSON.stringify(state.microtaskQueue)),
    consoleOutput: JSON.parse(JSON.stringify(state.consoleOutput)),
    highlightedCode: highlightLabel ? { line, label: highlightLabel } : undefined,
  })

  // PHASE 1: Execute synchronous code
  for (const stmt of statements) {
    if (stmt.type === 'console.log') {
      // Step 1: Show executing the line
      steps.push(
        createStep(
          'execute_line',
          stmt.line,
          `Executing console.log('${stmt.value}')`,
          { code: `console.log('${stmt.value}')` },
          'sync',
          'EXECUTING'
        )
      )

      // Step 2: Output to console
      state.consoleOutput.push({ value: stmt.value || '', line: stmt.line })
      steps.push(
        createStep(
          'console_output',
          stmt.line,
          `Logged "${stmt.value}" to console`,
          { value: stmt.value },
          'sync'
        )
      )
    } else if (stmt.type === 'setTimeout') {
      // Step 1: Show executing setTimeout
      steps.push(
        createStep(
          'execute_line',
          stmt.line,
          `Executing setTimeout with ${stmt.delay || 0}ms delay`,
          { delay: stmt.delay },
          'sync',
          'EXECUTING'
        )
      )

      // Step 2: Add to Web APIs
      const timerId = `timer_${++state.asyncIdCounter}`
      state.webApis.push({
        id: timerId,
        name: 'setTimeout',
        callback: `console.log('${stmt.callbackValue}')`,
        delay: stmt.delay || 0,
        startTime: Date.now(),
        remaining: stmt.delay || 0,
      })
      steps.push(
        createStep(
          'add_to_web_api',
          stmt.line,
          `Added setTimeout to Web APIs (${stmt.delay || 0}ms)`,
          { timerId, delay: stmt.delay, callback: stmt.callbackValue },
          'sync'
        )
      )
    } else if (stmt.type === 'promise.then') {
      // Step 1: Show executing Promise
      steps.push(
        createStep(
          'execute_line',
          stmt.line,
          'Executing Promise.resolve().then()',
          {},
          'sync',
          'EXECUTING'
        )
      )

      // Step 2: Add callback to microtask queue
      const promiseId = `promise_${++state.asyncIdCounter}`
      state.microtaskQueue.push({
        id: promiseId,
        name: '.then() callback',
        callback: `console.log('${stmt.callbackValue}')`,
        line: stmt.line,
      })
      steps.push(
        createStep(
          'add_to_microtask_queue',
          stmt.line,
          `Added .then() callback to Microtask Queue`,
          { promiseId, callback: stmt.callbackValue },
          'sync'
        )
      )
    }
  }

  // PHASE 2: Sync code complete, move timers to task queue
  steps.push(
    createStep(
      'event_loop_tick',
      0,
      'Synchronous code complete. Event loop checking queues...',
      { phase: 'transition' },
      'sync'
    )
  )

  // Move setTimeout timers to task queue (simulate 0ms timers completing)
  const completedTimers = [...state.webApis]
  for (const timer of completedTimers) {
    // Timer complete step
    state.webApis = state.webApis.filter((t) => t.id !== timer.id)
    steps.push(
      createStep(
        'web_api_complete',
        0,
        `Timer "${timer.id}" (${timer.delay}ms) completed in Web APIs`,
        { timerId: timer.id },
        'sync'
      )
    )

    // Add to task queue
    state.taskQueue.push({
      id: timer.id,
      name: 'setTimeout callback',
      callback: timer.callback,
      line: 0,
    })
    steps.push(
      createStep(
        'add_to_task_queue',
        0,
        'Callback moved to Task Queue (Macrotask)',
        { timerId: timer.id },
        'sync'
      )
    )
  }

  // PHASE 3: Process microtask queue
  if (state.microtaskQueue.length > 0) {
    steps.push(
      createStep(
        'check_microtasks',
        0,
        `Event Loop: checking microtask queue (${state.microtaskQueue.length} tasks)`,
        { count: state.microtaskQueue.length },
        'microtask'
      )
    )

    while (state.microtaskQueue.length > 0) {
      const task = state.microtaskQueue.shift()!

      // Push callback to call stack
      state.callStack.push({
        id: task.id,
        name: task.name,
        line: task.line,
        isAsync: true,
      })

      steps.push(
        createStep(
          'run_microtask',
          task.line,
          `Running microtask: ${task.name}`,
          { taskId: task.id, callback: task.callback },
          'microtask',
          'EXECUTING'
        )
      )

      // Execute the callback (console.log)
      const logMatch = task.callback.match(/console\.log\(['"](.+?)['"]\)/)
      if (logMatch) {
        state.consoleOutput.push({ value: logMatch[1], line: task.line })
        steps.push(
          createStep(
            'console_output',
            task.line,
            `Logged "${logMatch[1]}" to console`,
            { value: logMatch[1] },
            'microtask'
          )
        )
      }

      // Pop from call stack
      state.callStack.pop()
      steps.push(
        createStep(
          'call_stack_pop',
          task.line,
          `Microtask "${task.name}" completed`,
          { taskId: task.id },
          'microtask'
        )
      )

      // Check if more microtasks
      if (state.microtaskQueue.length > 0) {
        steps.push(
          createStep(
            'check_microtasks',
            0,
            `Event Loop: ${state.microtaskQueue.length} microtasks remaining`,
            { count: state.microtaskQueue.length },
            'microtask'
          )
        )
      }
    }
  }

  // PHASE 4: Process task queue (macrotasks)
  if (state.taskQueue.length > 0) {
    steps.push(
      createStep(
        'event_loop_tick',
        0,
        'Microtask Queue empty. Checking Task Queue (macrotasks)...',
        { phase: 'macrotask' },
        'microtask'
      )
    )

    steps.push(
      createStep(
        'check_task_queue',
        0,
        `Event Loop: checking task queue (${state.taskQueue.length} tasks)`,
        { count: state.taskQueue.length },
        'macrotask'
      )
    )

    while (state.taskQueue.length > 0) {
      const task = state.taskQueue.shift()!

      // Push callback to call stack
      state.callStack.push({
        id: task.id,
        name: task.name,
        line: task.line,
        isAsync: true,
      })

      steps.push(
        createStep(
          'run_task',
          task.line,
          `Running macrotask: ${task.name}`,
          { taskId: task.id, callback: task.callback },
          'macrotask',
          'EXECUTING'
        )
      )

      // Execute the callback (console.log)
      const logMatch = task.callback.match(/console\.log\(['"](.+?)['"]\)/)
      if (logMatch) {
        state.consoleOutput.push({ value: logMatch[1], line: task.line })
        steps.push(
          createStep(
            'console_output',
            task.line,
            `Logged "${logMatch[1]}" to console`,
            { value: logMatch[1] },
            'macrotask'
          )
        )
      }

      // Pop from call stack
      state.callStack.pop()
      steps.push(
        createStep(
          'call_stack_pop',
          task.line,
          `Macrotask "${task.name}" completed`,
          { taskId: task.id },
          'macrotask'
        )
      )

      // Check microtasks after each macrotask (important!)
      if (state.microtaskQueue.length > 0) {
        steps.push(
          createStep(
            'check_microtasks',
            0,
            'Checking microtask queue between macrotasks',
            { count: state.microtaskQueue.length },
            'macrotask'
          )
        )
      }

      // Check if more tasks
      if (state.taskQueue.length > 0) {
        steps.push(
          createStep(
            'check_task_queue',
            0,
            `Event Loop: ${state.taskQueue.length} macrotasks remaining`,
            { count: state.taskQueue.length },
            'macrotask'
          )
        )
      }
    }
  }

  // PHASE 5: Complete
  state.callStack = []
  steps.push(
    createStep(
      'event_loop_tick',
      0,
      'Execution complete. All queues empty.',
      { phase: 'complete' },
      'macrotask'
    )
  )

  return steps
}

function parseCodeStatements(code: string): ParsedStatement[] {
  const statements: ParsedStatement[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = i + 1
    const trimmed = lines[i].trim()

    if (!trimmed || trimmed.startsWith('//')) continue

    // console.log detection
    const consoleMatch = trimmed.match(/console\.log\(\s*['"](.+?)['"]\s*\)/)
    if (consoleMatch && !trimmed.includes('setTimeout') && !trimmed.includes('.then')) {
      statements.push({
        type: 'console.log',
        line,
        value: consoleMatch[1],
      })
      continue
    }

    // setTimeout detection
    if (trimmed.includes('setTimeout')) {
      const delayMatch = trimmed.match(/,\s*(\d+)\s*\)/)
      const delay = delayMatch ? parseInt(delayMatch[1]) : 0

      // Find the console.log inside the callback
      let callbackValue = 'callback'
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const innerMatch = lines[j].match(/console\.log\(\s*['"](.+?)['"]\s*\)/)
        if (innerMatch) {
          callbackValue = innerMatch[1]
          break
        }
      }

      statements.push({
        type: 'setTimeout',
        line,
        delay,
        callbackValue,
      })
      continue
    }

    // Promise.resolve().then() detection
    if (trimmed.includes('Promise.resolve') || trimmed.includes('.then(')) {
      // Find the console.log inside the callback
      let callbackValue = 'callback'
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const innerMatch = lines[j].match(/console\.log\(\s*['"](.+?)['"]\s*\)/)
        if (innerMatch) {
          callbackValue = innerMatch[1]
          break
        }
      }

      statements.push({
        type: 'promise.then',
        line,
        callbackValue,
      })
      continue
    }
  }

  return statements
}
