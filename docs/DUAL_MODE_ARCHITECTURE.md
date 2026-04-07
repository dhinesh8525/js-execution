# Dual-Mode Intelligent Visualizer Architecture

## Overview

The JS Execution Visualizer supports two distinct visualization modes:

1. **JS_RUNTIME Mode**: Visualizes JavaScript's event loop, call stack, Web APIs, and task queues
2. **DSA Mode**: Visualizes data structures and algorithms with array operations, recursion trees, and metrics

The system automatically detects which mode is appropriate based on code patterns, with manual override capability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        MODE DETECTION                            │
│  ModeDetector.ts → Analyzes code patterns → JS_RUNTIME | DSA   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   EventLoopEngine       │     │   DSAExecutionEngine    │
│   ─────────────────     │     │   ──────────────────    │
│   • Event loop phases   │     │   • Array operations    │
│   • Async tracking      │     │   • Recursion tracking  │
│   • Timer management    │     │   • Variable states     │
│   • JSRuntimeStep       │     │   • DSAExecutionStep    │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Execution Store (Zustand)                     │
│  ───────────────────────────────────────────────────────────    │
│  • Mode-aware state management                                   │
│  • Unified step handling via union type                         │
│  • JS Runtime state: callStack, queues, timers                  │
│  • DSA state: arrays, variables, recursionStack, metrics        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Dynamic UI Layer                              │
│  ───────────────────────────────────────────────────────────    │
│  JS_RUNTIME:                    │  DSA:                         │
│  • CallStackPanel               │  • ArrayVisualizerPanel       │
│  • WebApisPanel                 │  • RecursionTreePanel         │
│  • TaskQueuePanel               │  • VariablesPanel             │
│  • MicrotaskQueuePanel          │  • AlgorithmMetricsPanel      │
│  • EventLoopDiagram             │                               │
│  • ConnectionArrows             │                               │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
engine/
├── detector/
│   ├── index.ts                 # Public exports
│   └── ModeDetector.ts          # Code classification logic
│
└── simulator/
    ├── index.ts                 # Public exports
    ├── types.ts                 # All type definitions
    ├── EventLoopEngine.ts       # JS Runtime simulation
    ├── DSAExecutionEngine.ts    # DSA algorithm simulation
    ├── CodeAnalyzer.ts          # AST parsing
    ├── ExecutionController.ts   # State machine
    └── TimelineGenerator.ts     # Timeline events

components/
├── controls/
│   └── ModeSelector.tsx         # Mode toggle UI
│
└── panels/
    ├── CallStackPanel.tsx       # JS: Call stack
    ├── WebApisPanel.tsx         # JS: Web APIs
    ├── TaskQueuePanel.tsx       # JS: Macrotask queue
    ├── MicrotaskQueuePanel.tsx  # JS: Microtask queue
    ├── EventLoopDiagram.tsx     # JS: Event loop phases
    ├── ArrayVisualizerPanel.tsx # DSA: Array visualization
    ├── RecursionTreePanel.tsx   # DSA: Recursion tree
    ├── VariablesPanel.tsx       # DSA: Variable tracking
    ├── AlgorithmMetricsPanel.tsx# DSA: Metrics display
    ├── ConsolePanel.tsx         # Shared: Console output
    ├── ExplanationPanel.tsx     # Shared: Step explanations
    └── ControlPanel.tsx         # Shared: Playback controls

stores/
└── executionStore.ts            # Mode-aware state management
```

## Type System

### Execution Modes

```typescript
type ExecutionMode = 'JS_RUNTIME' | 'DSA'

type AlgorithmType =
  | 'SORTING'
  | 'SEARCHING'
  | 'TREE_TRAVERSAL'
  | 'GRAPH_TRAVERSAL'
  | 'RECURSION'
  | 'DYNAMIC_PROGRAMMING'
  | 'LINKED_LIST'
  | 'STACK_QUEUE'
  | 'GENERIC'
```

### Step Types (Union)

```typescript
// Union type for all execution steps
type ExecutionStep = JSRuntimeStep | DSAExecutionStep

// JS Runtime step (event loop visualization)
interface JSRuntimeStep {
  mode: 'JS_RUNTIME'
  type: StepType              // 'sync-execute', 'schedule-microtask', etc.
  phase: EventLoopPhase       // 'sync', 'microtask', 'macrotask', 'idle'
  callStack: StackFrame[]
  microtaskQueue: MicrotaskItem[]
  macrotaskQueue: MacrotaskItem[]
  webApiTimers: WebApiTimer[]
  // ... other JS-specific fields
}

// DSA step (algorithm visualization)
interface DSAExecutionStep {
  mode: 'DSA'
  type: DSAStepType           // 'array-swap', 'recursion-call', etc.
  algorithmType: AlgorithmType
  arrays: ArrayState[]
  variables: VariableState[]
  recursionStack: RecursionFrame[]
  comparisons: number
  swaps: number
  recursionDepth: number
  // ... other DSA-specific fields
}
```

### Type Guards

```typescript
// Check if step is JS Runtime mode
function isJSRuntimeStep(step: ExecutionStep): step is JSRuntimeStep {
  return step.mode === 'JS_RUNTIME'
}

// Check if step is DSA mode
function isDSAStep(step: ExecutionStep): step is DSAExecutionStep {
  return step.mode === 'DSA'
}
```

## Mode Detection

The `ModeDetector` class analyzes code patterns to determine the appropriate visualization mode.

### JS Runtime Indicators (High Weight)

| Pattern | Weight | Description |
|---------|--------|-------------|
| `setTimeout` | 10 | Timer API |
| `setInterval` | 10 | Interval API |
| `Promise` | 10 | Promise usage |
| `async/await` | 10 | Async functions |
| `fetch` | 10 | Network requests |
| `.then()/.catch()` | 8 | Promise chains |
| `queueMicrotask` | 10 | Direct microtask |

### DSA Indicators (Moderate Weight)

| Pattern | Weight | Description |
|---------|--------|-------------|
| Array swap | 8 | `[arr[i], arr[j]] = [arr[j], arr[i]]` |
| Nested loops | 5 | `for...for` patterns |
| Binary search | 6 | `left <= right` pattern |
| Tree traversal | 8 | `node.left/right` |
| Recursion | 7 | Self-calling functions |
| DP table | 8 | `dp[i][j]` patterns |

### Algorithm Type Detection

Once DSA mode is detected, the specific algorithm type is identified:

- **SORTING**: Swap patterns, comparison loops, sort keywords
- **SEARCHING**: Binary search patterns, left/right/mid variables
- **RECURSION**: Fibonacci, factorial, recursive patterns
- **TREE_TRAVERSAL**: Inorder, preorder, postorder patterns
- **GRAPH_TRAVERSAL**: BFS, DFS, adjacency patterns
- **DYNAMIC_PROGRAMMING**: DP table patterns, memoization

## Execution Engines

### EventLoopEngine (JS Runtime)

Simulates the JavaScript event loop with correct semantics:

1. Execute all synchronous code
2. Drain ALL microtasks (including newly added ones)
3. Execute ONE macrotask
4. Return to step 2
5. Repeat until all queues are empty

**Key Methods:**
- `simulate(code: string): JSRuntimeStep[]`
- `drainMicrotaskQueue()`: Processes all microtasks
- `runOneMacrotask()`: Executes single macrotask
- `processCompletedTimers()`: Moves timers to queue

### DSAExecutionEngine (Algorithms)

Traces algorithm execution through code instrumentation:

1. Parse code and identify function names
2. Instrument code with trace calls
3. Execute in sandboxed environment
4. Convert trace events to visualization steps

**Key Methods:**
- `simulate(code: string, algorithmType?: AlgorithmType): DSAExecutionStep[]`
- `instrumentCode(code: string): string`
- `handleArraySwap()`, `handleCompare()`, etc.

## State Management

The execution store manages mode-aware state:

```typescript
interface ExecutionState {
  // Mode detection
  executionMode: ExecutionMode
  algorithmType: AlgorithmType | null
  manualModeOverride: ExecutionMode | null

  // JS Runtime state
  callStack: StackFrame[]
  microtaskQueue: MicrotaskItem[]
  macrotaskQueue: MacrotaskItem[]
  webApiTimers: WebApiTimer[]

  // DSA state
  arrays: ArrayState[]
  variables: VariableState[]
  recursionStack: RecursionFrame[]
  totalComparisons: number
  totalSwaps: number

  // Shared state
  steps: ExecutionStep[]
  currentStep: number
  consoleOutput: ConsoleOutput[]
}
```

## UI Components

### Shared Components

| Component | Description |
|-----------|-------------|
| `ModeSelector` | Toggle between modes with confidence display |
| `ControlPanel` | Playback controls (play, pause, step) |
| `ConsolePanel` | Console output display |
| `ExplanationPanel` | Step-by-step explanations |

### JS Runtime Components

| Component | Description |
|-----------|-------------|
| `CallStackPanel` | Visualizes function call stack |
| `WebApisPanel` | Shows active timers in Web APIs |
| `TaskQueuePanel` | Displays macrotask queue |
| `MicrotaskQueuePanel` | Displays microtask queue |
| `EventLoopDiagram` | Shows current event loop phase |
| `ConnectionArrows` | Animated arrows between components |

### DSA Components

| Component | Description |
|-----------|-------------|
| `ArrayVisualizerPanel` | Bar chart with color-coded operations |
| `RecursionTreePanel` | Hierarchical call tree |
| `VariablesPanel` | Current variable values with change tracking |
| `AlgorithmMetricsPanel` | Comparisons, swaps, depth metrics |

## Extending the System

### Adding New Algorithm Types

1. Add the type to `AlgorithmType` in `types.ts`
2. Add detection patterns in `ModeDetector.ts`
3. Add handling in `DSAExecutionEngine.ts`
4. Create visualization components if needed

### Adding New Visualization Panels

1. Create component in `components/panels/`
2. Connect to execution store
3. Add conditional rendering in `app/page.tsx`
4. Handle animation with Framer Motion

### Adding New Step Types

1. Add to `DSAStepType` or `StepType` in `types.ts`
2. Implement handling in respective engine
3. Update step diff computation if needed
4. Add UI representation in panels
