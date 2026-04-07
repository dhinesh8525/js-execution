# API Reference

## Mode Detection

### ModeDetector

Analyzes JavaScript code to determine the appropriate visualization mode.

```typescript
import { ModeDetector } from '@/engine/detector'
```

#### Methods

##### `detect(code: string): ModeDetectionResult`

Analyzes code and returns detection results.

```typescript
interface ModeDetectionResult {
  mode: ExecutionMode           // 'JS_RUNTIME' | 'DSA'
  confidence: number            // 0-1 score
  algorithmType: AlgorithmType | null
  indicators: {
    jsRuntime: string[]         // Detected JS patterns
    dsa: string[]               // Detected DSA patterns
  }
}
```

**Example:**
```typescript
const code = `
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}
`

const result = ModeDetector.detect(code)
// {
//   mode: 'DSA',
//   confidence: 0.85,
//   algorithmType: 'SORTING',
//   indicators: {
//     jsRuntime: [],
//     dsa: ['Nested loops', 'Array swap']
//   }
// }
```

##### `forceMode(mode: ExecutionMode, algorithmType?: AlgorithmType): ModeDetectionResult`

Creates a detection result for manual mode override.

```typescript
const result = ModeDetector.forceMode('DSA', 'SEARCHING')
// { mode: 'DSA', confidence: 1, algorithmType: 'SEARCHING', indicators: {...} }
```

---

## Execution Engines

### EventLoopEngine

Simulates JavaScript event loop execution.

```typescript
import { EventLoopEngine } from '@/engine/simulator'
```

#### Constructor

```typescript
new EventLoopEngine(config?: Partial<EventLoopEngineConfig>)
```

**Config Options:**
```typescript
interface EventLoopEngineConfig {
  maxSteps?: number           // Default: 1000
  maxTime?: number            // Default: 60000ms
  includeExplanations?: boolean // Default: true
}
```

#### Methods

##### `simulate(code: string): JSRuntimeStep[]`

Executes code and returns visualization steps.

```typescript
const engine = new EventLoopEngine({ maxSteps: 500 })
const steps = engine.simulate(`
  console.log('Start');
  setTimeout(() => console.log('Timeout'), 0);
  Promise.resolve().then(() => console.log('Promise'));
  console.log('End');
`)

// Returns array of JSRuntimeStep objects
```

---

### DSAExecutionEngine

Simulates algorithm execution with tracing.

```typescript
import { DSAExecutionEngine } from '@/engine/simulator'
```

#### Constructor

```typescript
new DSAExecutionEngine(config?: Partial<DSAEngineConfig>)
```

**Config Options:**
```typescript
interface DSAEngineConfig {
  maxSteps?: number           // Default: 1000
  includeExplanations?: boolean // Default: true
  algorithmType?: AlgorithmType // Default: 'GENERIC'
}
```

#### Methods

##### `simulate(code: string, algorithmType?: AlgorithmType): DSAExecutionStep[]`

Executes algorithm code and returns visualization steps.

```typescript
const engine = new DSAExecutionEngine({ algorithmType: 'SORTING' })
const steps = engine.simulate(`
  const arr = [64, 34, 25, 12];
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
`)

// Returns array of DSAExecutionStep objects
```

---

## Type Definitions

### ExecutionStep (Union Type)

```typescript
type ExecutionStep = JSRuntimeStep | DSAExecutionStep
```

### JSRuntimeStep

```typescript
interface JSRuntimeStep {
  index: number
  mode: 'JS_RUNTIME'
  type: StepType
  phase: EventLoopPhase
  description: string
  explanation?: string
  currentLine: number | null
  lineLabel?: string
  scheduledFromLine?: number | null
  highlights: LineHighlight[]

  // State snapshots
  callStack: StackFrame[]
  microtaskQueue: MicrotaskItem[]
  macrotaskQueue: MacrotaskItem[]
  webApiTimers: WebApiTimer[]
  consoleOutput: ConsoleOutput[]

  virtualTime: number
  connections: VisualConnection[]
}
```

### DSAExecutionStep

```typescript
interface DSAExecutionStep {
  index: number
  mode: 'DSA'
  type: DSAStepType
  algorithmType: AlgorithmType
  description: string
  explanation?: string
  currentLine: number | null
  highlights: LineHighlight[]

  // State snapshots
  arrays: ArrayState[]
  variables: VariableState[]
  recursionStack: RecursionFrame[]
  treeState: TreeNodeState | null
  graphState: GraphState | null
  dpTable: DPTableState | null
  consoleOutput: ConsoleOutput[]

  // Metrics
  comparisons: number
  swaps: number
  recursionDepth: number
}
```

### StepType (JS Runtime)

```typescript
type StepType =
  | 'sync-start'
  | 'sync-execute'
  | 'sync-complete'
  | 'call-stack-push'
  | 'call-stack-pop'
  | 'schedule-microtask'
  | 'schedule-macrotask'
  | 'timer-register'
  | 'timer-complete'
  | 'event-loop-check-microtasks'
  | 'event-loop-run-microtask'
  | 'event-loop-microtasks-empty'
  | 'event-loop-check-macrotasks'
  | 'event-loop-run-macrotask'
  | 'event-loop-complete'
  | 'console-output'
```

### DSAStepType

```typescript
type DSAStepType =
  | 'array-init'
  | 'array-access'
  | 'array-swap'
  | 'array-compare'
  | 'array-set'
  | 'recursion-call'
  | 'recursion-return'
  | 'recursion-base-case'
  | 'tree-visit'
  | 'tree-insert'
  | 'tree-delete'
  | 'graph-visit'
  | 'graph-edge'
  | 'graph-mark-visited'
  | 'dp-init'
  | 'dp-compute'
  | 'dp-lookup'
  | 'pointer-move'
  | 'variable-update'
  | 'function-call'
  | 'function-return'
  | 'loop-iteration'
  | 'condition-check'
  | 'algorithm-start'
  | 'algorithm-complete'
  | 'console-output'
```

### ArrayState

```typescript
interface ArrayState {
  id: string
  name: string
  values: (number | string | null)[]
  comparing: number[]     // Indices being compared
  swapping: number[]      // Indices being swapped
  sorted: number[]        // Indices that are sorted
  accessing: number[]     // Indices being accessed
  pointers: Record<string, number>  // Named pointers (i, j, left, right, etc.)
}
```

### VariableState

```typescript
interface VariableState {
  name: string
  value: unknown
  type: 'number' | 'string' | 'boolean' | 'array' | 'object' | 'null' | 'undefined'
  changed: boolean        // Whether value changed in this step
  previousValue?: unknown // Previous value for delta display
}
```

### RecursionFrame

```typescript
interface RecursionFrame {
  id: string
  functionName: string
  args: Record<string, unknown>
  depth: number
  returnValue?: unknown
  isActive: boolean
  isComplete: boolean
  parentId: string | null
  callLine: number
}
```

---

## Type Guards

### isJSRuntimeStep

```typescript
function isJSRuntimeStep(step: ExecutionStep): step is JSRuntimeStep
```

**Example:**
```typescript
if (isJSRuntimeStep(step)) {
  // TypeScript knows step has callStack, microtaskQueue, etc.
  console.log(step.callStack.length)
}
```

### isDSAStep

```typescript
function isDSAStep(step: ExecutionStep): step is DSAExecutionStep
```

**Example:**
```typescript
if (isDSAStep(step)) {
  // TypeScript knows step has arrays, variables, etc.
  console.log(step.arrays[0].values)
}
```

---

## Execution Store

### State

```typescript
interface ExecutionState {
  // Core step data
  steps: ExecutionStep[]
  currentStep: number
  totalSteps: number

  // Mode detection
  executionMode: ExecutionMode
  algorithmType: AlgorithmType | null
  modeConfidence: number
  manualModeOverride: ExecutionMode | null

  // JS Runtime state
  callStack: StackFrame[]
  webApiTimers: WebApiTimer[]
  macrotaskQueue: MacrotaskItem[]
  microtaskQueue: MicrotaskItem[]
  currentPhase: EventLoopPhase
  connections: VisualConnection[]
  virtualTime: number

  // DSA state
  arrays: ArrayState[]
  variables: VariableState[]
  recursionStack: RecursionFrame[]
  treeState: TreeNodeState | null
  graphState: GraphState | null
  dpTable: DPTableState | null
  totalComparisons: number
  totalSwaps: number
  maxRecursionDepth: number

  // Shared state
  consoleOutput: ConsoleOutput[]
  currentLine: number | null
  currentDescription: string
  currentExplanation: string | null
  highlights: LineHighlight[]
  status: ExecutionStatus
  error: { message: string; line?: number } | null
}
```

### Actions

```typescript
// Set steps and optionally specify mode
setSteps(steps: ExecutionStep[], mode?: ExecutionMode, algorithmType?: AlgorithmType | null): void

// Set execution mode
setMode(mode: ExecutionMode, algorithmType?: AlgorithmType | null): void

// Set manual mode override
setManualModeOverride(mode: ExecutionMode | null): void

// Navigation
goToStep(step: number): void
nextStep(): boolean
prevStep(): boolean

// Playback control
play(): void
pause(): void
reset(): void
setPlaybackSpeed(speed: number): void

// Error handling
setError(error: { message: string; line?: number } | null): void
```

### Usage

```typescript
import { useExecutionStore } from '@/stores/executionStore'

function MyComponent() {
  const executionMode = useExecutionStore((s) => s.executionMode)
  const arrays = useExecutionStore((s) => s.arrays)
  const goToStep = useExecutionStore((s) => s.goToStep)

  // Render based on mode
  if (executionMode === 'DSA') {
    return <ArrayVisualization arrays={arrays} />
  }

  return <EventLoopVisualization />
}
```
