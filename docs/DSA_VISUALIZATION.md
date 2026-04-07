# DSA Visualization Guide

## Overview

The DSA (Data Structures & Algorithms) visualization mode provides step-by-step visualization of algorithm execution, including:

- Array operations with animated bar charts
- Recursion tree visualization
- Variable state tracking
- Performance metrics (comparisons, swaps, depth)

## Supported Algorithm Types

| Type | Description | Example Algorithms |
|------|-------------|-------------------|
| `SORTING` | Sorting algorithms | Bubble Sort, Merge Sort, Quick Sort |
| `SEARCHING` | Search algorithms | Binary Search, Linear Search |
| `RECURSION` | Recursive algorithms | Fibonacci, Factorial, Tower of Hanoi |
| `TREE_TRAVERSAL` | Tree operations | Inorder, Preorder, Postorder, Level Order |
| `GRAPH_TRAVERSAL` | Graph algorithms | BFS, DFS, Dijkstra |
| `DYNAMIC_PROGRAMMING` | DP algorithms | Knapsack, LCS, Coin Change |
| `LINKED_LIST` | List operations | Traversal, Reversal, Merge |
| `STACK_QUEUE` | Stack/Queue operations | Push, Pop, Enqueue, Dequeue |
| `GENERIC` | Other algorithms | Default for unclassified code |

## Visualization Panels

### Array Visualizer Panel

Displays arrays as bar charts with visual indicators:

| Color | Meaning |
|-------|---------|
| Gray | Default/unsorted |
| Yellow | Currently comparing |
| Red | Currently swapping |
| Green | Sorted/finalized |
| Blue | Being accessed |

**Features:**
- Height proportional to value
- Index labels below bars
- Pointer indicators above bars (i, j, left, right, mid)
- Smooth swap animations

### Recursion Tree Panel

Shows the call stack as a hierarchical tree:

- **Active frames**: Highlighted with cyan border
- **Completed frames**: Show return value
- **Depth indicator**: Shows nesting level
- **Arguments**: Displayed in each frame

### Variables Panel

Tracks variable states:

- Current value with type indicator
- Change highlighting when value updates
- Previous value display for changed variables
- Color-coded type badges

### Algorithm Metrics Panel

Displays performance metrics:

- **Comparisons**: Total number of comparisons made
- **Swaps**: Total number of swaps performed
- **Max Depth**: Maximum recursion depth reached
- **Algorithm Type**: Badge showing detected type

## Code Instrumentation

The DSA engine works by instrumenting code to capture operations:

### Tracked Operations

| Operation | Description |
|-----------|-------------|
| Array initialization | `const arr = [1, 2, 3]` |
| Array access | `arr[i]` |
| Array swap | `[arr[i], arr[j]] = [arr[j], arr[i]]` |
| Variable assignment | `let x = 5` |
| Function calls | Recursive function invocations |
| Console output | `console.log()` |

### Instrumentation Example

Original code:
```javascript
const arr = [3, 1, 2];
[arr[0], arr[1]] = [arr[1], arr[0]];
```

Instrumented (internally):
```javascript
const arr = (function() {
  const __arr = [3, 1, 2];
  __traceArrayInit("arr", __arr, 1);
  return __arr;
})();
(function() {
  __traceArraySwap("arr", 0, 1, 2);
  [arr[0], arr[1]] = [arr[1], arr[0]];
})();
```

## Example Algorithms

### Bubble Sort

```javascript
function bubbleSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }

  return arr;
}

const arr = [64, 34, 25, 12, 22];
bubbleSort(arr);
```

**Visualization:**
- Array bars show comparisons (yellow) and swaps (red)
- Sorted portion grows from right (green)
- Metrics show comparison and swap counts

### Binary Search

```javascript
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    }

    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}

const arr = [1, 3, 5, 7, 9, 11, 13];
binarySearch(arr, 7);
```

**Visualization:**
- Pointer indicators show left, right, mid positions
- Current access highlighted in blue
- Variables panel shows pointer values updating

### Fibonacci (Recursive)

```javascript
function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

fibonacci(5);
```

**Visualization:**
- Recursion tree shows call hierarchy
- Active frame highlighted
- Return values appear on completed frames
- Depth metric tracks maximum nesting

## Customization

### Algorithm Type Override

Force a specific algorithm type for better visualization:

```typescript
const engine = new DSAExecutionEngine({
  algorithmType: 'SORTING'
})
const steps = engine.simulate(code, 'SORTING')
```

### Manual Mode Selection

Override auto-detection with manual mode:

```typescript
// In the UI
setManualModeOverride('DSA')
```

## Current Limitations

1. **Code Instrumentation**: Complex expressions may not be fully traced
2. **Tree/Graph Visualization**: Currently returns null (TODO)
3. **DP Table**: Currently returns null (TODO)
4. **Object Tracking**: Only arrays and primitives are tracked

## Future Enhancements

- Tree structure visualization (BST, AVL, etc.)
- Graph visualization with force-directed layout
- DP table with dependency arrows
- Memory/heap visualization for objects
- Custom data structure support
