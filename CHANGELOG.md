# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-03-22

### Added

#### Dual-Mode Visualization System
- **Mode Detection** (`engine/detector/ModeDetector.ts`)
  - Automatic detection of JS Runtime vs DSA code patterns
  - Confidence scoring based on pattern matching
  - Algorithm type detection (SORTING, SEARCHING, RECURSION, etc.)

- **DSA Execution Engine** (`engine/simulator/DSAExecutionEngine.ts`)
  - Code instrumentation for tracing array operations
  - Variable state tracking with change detection
  - Recursion call stack management
  - Performance metrics collection (comparisons, swaps, depth)

- **New Type Definitions** (`engine/simulator/types.ts`)
  - `ExecutionMode`: 'JS_RUNTIME' | 'DSA'
  - `AlgorithmType`: SORTING, SEARCHING, RECURSION, etc.
  - `DSAStepType`: array-swap, recursion-call, etc.
  - `DSAExecutionStep`: Complete DSA visualization step
  - `ArrayState`, `VariableState`, `RecursionFrame`: DSA state types
  - Union type: `ExecutionStep = JSRuntimeStep | DSAExecutionStep`
  - Type guards: `isJSRuntimeStep()`, `isDSAStep()`

- **DSA Visualization Panels**
  - `ArrayVisualizerPanel`: Bar chart with color-coded operations
  - `RecursionTreePanel`: Hierarchical call tree visualization
  - `VariablesPanel`: Variable tracking with change indicators
  - `AlgorithmMetricsPanel`: Comparisons, swaps, depth metrics

- **Mode Selector Component** (`components/controls/ModeSelector.tsx`)
  - Toggle between JS Runtime and DSA modes
  - Shows auto-detected mode with confidence
  - Algorithm type indicator in DSA mode

- **Documentation** (`docs/`)
  - `DUAL_MODE_ARCHITECTURE.md`: System architecture overview
  - `API_REFERENCE.md`: Complete API documentation
  - `DSA_VISUALIZATION.md`: DSA mode usage guide

### Changed

- **EventLoopEngine** (`engine/simulator/EventLoopEngine.ts`)
  - Now returns `JSRuntimeStep[]` instead of `ExecutionStep[]`
  - Added `mode: 'JS_RUNTIME'` discriminator to all steps

- **Execution Store** (`stores/executionStore.ts`)
  - Extended with mode-aware state management
  - Added DSA-specific state fields (arrays, variables, recursionStack)
  - Added metrics tracking (comparisons, swaps, depth)
  - `goToStep()` now handles both step types
  - New actions: `setMode()`, `setManualModeOverride()`

- **Main Page** (`app/page.tsx`)
  - Mode detection on code change
  - Conditional panel rendering based on mode
  - Mode selector in header
  - Engine selection based on mode

- **ExecutionController** (`engine/simulator/ExecutionController.ts`)
  - Updated `computeStepDiff()` to handle union type
  - Returns empty diff for DSA steps (not applicable)

- **TimelineGenerator** (`engine/simulator/TimelineGenerator.ts`)
  - Added type guard checks for JS Runtime steps
  - Skips DSA steps in timeline generation

- **Constants** (`lib/constants.ts`)
  - Added mode metadata to example categories
  - Added `DSA_EXAMPLES_BY_TYPE` categorization
  - Added `getSuggestedMode()` helper function

### Technical Details

#### Type System Changes
```typescript
// Before
interface ExecutionStep {
  type: StepType
  phase: EventLoopPhase
  callStack: StackFrame[]
  // ...
}

// After
type ExecutionStep = JSRuntimeStep | DSAExecutionStep

interface JSRuntimeStep {
  mode: 'JS_RUNTIME'
  type: StepType
  phase: EventLoopPhase
  callStack: StackFrame[]
  // ...
}

interface DSAExecutionStep {
  mode: 'DSA'
  type: DSAStepType
  algorithmType: AlgorithmType
  arrays: ArrayState[]
  // ...
}
```

#### Mode Detection Patterns
- **JS Runtime**: setTimeout, Promise, async/await, fetch, .then()
- **DSA**: Array swaps, nested loops, left/right pointers, recursion

#### Breaking Changes
- `ExecutionStep` is now a union type
- Code using `step.callStack` directly must now use type guards
- `EventLoopEngine.simulate()` return type changed

### Migration Guide

If you have code that directly accesses step properties:

```typescript
// Before
const callStack = step.callStack

// After
import { isJSRuntimeStep } from '@/engine/simulator'

if (isJSRuntimeStep(step)) {
  const callStack = step.callStack
}
```

## [1.0.0] - Initial Release

- Event loop visualization
- Call stack panel
- Web APIs panel
- Task/Microtask queue panels
- Console output panel
- Playback controls
- Example snippets
