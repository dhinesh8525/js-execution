import type {
  TraceEvent,
  StackFrame,
  Scope,
  HeapObject,
  ConsoleEntry,
  ExecutionSnapshot,
} from '@/types/execution'

let idCounter = 0
const generateId = () => `id_${++idCounter}`

export class TraceCollector {
  private callStack: StackFrame[] = []
  private scopes: Map<string, Scope> = new Map()
  private heap: Map<string, HeapObject> = new Map()
  private consoleEntries: ConsoleEntry[] = []
  private snapshots: Map<number, ExecutionSnapshot> = new Map()

  reset() {
    this.callStack = []
    this.scopes = new Map()
    this.heap = new Map()
    this.consoleEntries = []
    this.snapshots = new Map()
    idCounter = 0
  }

  processEvent(event: any, stepIndex: number): ExecutionSnapshot {
    const eventType = event.type

    switch (eventType) {
      case 'scope_enter':
        this.handleScopeEnter(event)
        break
      case 'scope_exit':
        this.handleScopeExit(event)
        break
      case 'declare':
        this.handleDeclare(event)
        break
      case 'assign':
        this.handleAssign(event)
        break
      case 'console':
        this.handleConsole(event)
        break
      case 'error':
        // Handle error event
        break
    }

    const snapshot = this.createSnapshot(stepIndex, event.line || 0)
    this.snapshots.set(stepIndex, snapshot)
    return snapshot
  }

  private handleScopeEnter(event: any) {
    const scope: Scope = {
      id: event.scopeId,
      parentId: this.scopes.size > 0 ? Array.from(this.scopes.keys()).pop() || null : null,
      type: event.scopeType || event.type === 'function' ? 'function' : 'global',
      name: event.name || 'anonymous',
      variables: new Map(),
      location: { line: event.line || 0, column: 0 },
    }
    this.scopes.set(event.scopeId, scope)

    // Add stack frame for function scopes
    if (event.type === 'function' || event.scopeType === 'function') {
      const frame: StackFrame = {
        id: generateId(),
        name: event.name || 'anonymous',
        location: { line: event.line || 0, column: 0 },
        scopeId: event.scopeId,
        isAsync: false,
        args: [],
      }
      this.callStack.push(frame)
    }
  }

  private handleScopeExit(event: any) {
    const scope = this.scopes.get(event.scopeId)
    if (scope && (scope.type === 'function')) {
      this.callStack.pop()
    }
  }

  private handleDeclare(event: any) {
    const scopeId = event.scopeId || 'global'
    let scope = this.scopes.get(scopeId)

    if (!scope) {
      // Create scope if it doesn't exist
      scope = {
        id: scopeId,
        parentId: null,
        type: 'global',
        name: 'Global',
        variables: new Map(),
        location: { line: 0, column: 0 },
      }
      this.scopes.set(scopeId, scope)
    }

    scope.variables.set(event.name, {
      name: event.name,
      value: {
        type: 'primitive',
        value: undefined,
        preview: 'undefined',
      },
      type: 'undefined',
      declarationType: event.kind || 'var',
    })
  }

  private handleAssign(event: any) {
    const scopeId = event.scopeId || 'global'
    const scope = this.scopes.get(scopeId)

    if (scope && scope.variables.has(event.name)) {
      const variable = scope.variables.get(event.name)!
      variable.value = {
        type: 'primitive',
        value: event.value,
        preview: String(event.value),
      }
    }
  }

  private handleConsole(event: any) {
    this.consoleEntries.push({
      id: generateId(),
      level: event.level || 'log',
      args: [{ type: 'primitive', value: 'logged', preview: 'logged' }],
      timestamp: event.timestamp,
      location: { line: event.line || 0, column: 0 },
    })
  }

  private createSnapshot(stepIndex: number, currentLine: number): ExecutionSnapshot {
    return {
      stepIndex,
      callStack: [...this.callStack],
      scopes: new Map(this.scopes),
      heap: new Map(this.heap),
      currentLine,
      console: [...this.consoleEntries],
      eventLoop: {
        phase: 'call-stack',
        callbackQueue: [],
        microtaskQueue: [],
      },
    }
  }

  getSnapshot(stepIndex: number): ExecutionSnapshot | undefined {
    return this.snapshots.get(stepIndex)
  }

  getCurrentState(): Omit<ExecutionSnapshot, 'stepIndex'> {
    return {
      callStack: [...this.callStack],
      scopes: new Map(this.scopes),
      heap: new Map(this.heap),
      currentLine: 0,
      console: [...this.consoleEntries],
      eventLoop: {
        phase: 'call-stack',
        callbackQueue: [],
        microtaskQueue: [],
      },
    }
  }
}
