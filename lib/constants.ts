import {
  BUBBLE_SORT,
  SELECTION_SORT,
  INSERTION_SORT,
  QUICK_SORT,
  MERGE_SORT,
  LINEAR_SEARCH,
  BINARY_SEARCH,
  BINARY_SEARCH_RECURSIVE,
  FACTORIAL,
  FIBONACCI,
  POWER,
  SUM_ARRAY,
  TREE_DFS,
  GRAPH_DFS,
  GRAPH_BFS,
  SUBSETS,
  PERMUTATIONS,
  N_QUEENS,
  STACK_OPERATIONS,
  QUEUE_OPERATIONS,
} from './dsa-algorithms'

export const EDITOR_OPTIONS = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: 'on' as const,
  lineNumbers: 'on' as const,
  glyphMargin: true,
  folding: true,
  lineDecorationsWidth: 10,
  renderLineHighlight: 'all' as const,
}

export const EXAMPLE_SNIPPETS = {
  // ============================================================================
  // JS RUNTIME EXAMPLES (Event Loop Visualization)
  // ============================================================================

  eventLoop: {
    title: 'Event Loop Demo',
    category: 'async',
    mode: 'JS_RUNTIME' as const,
    complexity: { time: 'O(1)', space: 'O(n)' },
    description: 'Classic example showing the event loop, task queue, and microtask queue ordering',
    code: `console.log('1. Start');

setTimeout(() => {
  console.log('4. Timeout callback');
}, 0);

Promise.resolve().then(() => {
  console.log('3. Promise callback');
});

console.log('2. End');

// Output order: 1, 2, 3, 4
// Sync code runs first, then microtasks, then macrotasks`,
  },

  promiseChain: {
    title: 'Promise Chain',
    category: 'async',
    mode: 'JS_RUNTIME' as const,
    complexity: { time: 'O(n)', space: 'O(n)' },
    description: 'Shows how promise chains execute through the microtask queue',
    code: `console.log('Start');

Promise.resolve(1)
  .then(value => {
    console.log('Then 1:', value);
    return value + 1;
  })
  .then(value => {
    console.log('Then 2:', value);
    return value + 1;
  })
  .then(value => {
    console.log('Then 3:', value);
  });

console.log('End');

// Each .then() is a separate microtask`,
  },

  multipleTimers: {
    title: 'Multiple Timers',
    category: 'async',
    mode: 'JS_RUNTIME' as const,
    complexity: { time: 'O(1)', space: 'O(n)' },
    description: 'Shows how multiple setTimeout callbacks are queued and executed',
    code: `console.log('Start');

setTimeout(() => {
  console.log('Timer 1 (0ms)');
}, 0);

setTimeout(() => {
  console.log('Timer 2 (0ms)');
}, 0);

setTimeout(() => {
  console.log('Timer 3 (100ms)');
}, 100);

Promise.resolve().then(() => {
  console.log('Promise (microtask)');
});

console.log('End');

// Microtasks run before any macrotasks`,
  },

  nestedPromises: {
    title: 'Nested Promises',
    category: 'async',
    mode: 'JS_RUNTIME' as const,
    complexity: { time: 'O(n)', space: 'O(n)' },
    description: 'Shows microtasks scheduling more microtasks',
    code: `console.log('Start');

Promise.resolve().then(() => {
  console.log('Promise 1');

  Promise.resolve().then(() => {
    console.log('Nested Promise');
  });
});

Promise.resolve().then(() => {
  console.log('Promise 2');
});

console.log('End');

// Nested microtasks run before macrotasks`,
  },

  timerWithPromise: {
    title: 'Timer + Promise Mix',
    category: 'async',
    mode: 'JS_RUNTIME' as const,
    complexity: { time: 'O(1)', space: 'O(n)' },
    description: 'Shows interaction between timers and promises',
    code: `console.log('Script start');

setTimeout(() => {
  console.log('setTimeout');

  Promise.resolve().then(() => {
    console.log('Promise inside timeout');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('Promise 1');
}).then(() => {
  console.log('Promise 2');
});

console.log('Script end');`,
  },

  // ============================================================================
  // DSA EXAMPLES - SORTING (Real Algorithms with Trace)
  // ============================================================================

  bubbleSort: {
    title: 'Bubble Sort',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(n²)', space: 'O(1)' },
    description: 'Compare adjacent elements and swap if out of order',
    code: BUBBLE_SORT,
  },

  selectionSort: {
    title: 'Selection Sort',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(n²)', space: 'O(1)' },
    description: 'Find minimum element and place at beginning',
    code: SELECTION_SORT,
  },

  insertionSort: {
    title: 'Insertion Sort',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(n²)', space: 'O(1)' },
    description: 'Build sorted array one element at a time',
    code: INSERTION_SORT,
  },

  quickSort: {
    title: 'Quick Sort',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(n log n)', space: 'O(log n)' },
    description: 'Divide and conquer using pivot partitioning',
    code: QUICK_SORT,
  },

  mergeSort: {
    title: 'Merge Sort',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    description: 'Divide, sort, and merge subarrays',
    code: MERGE_SORT,
  },

  // ============================================================================
  // DSA EXAMPLES - SEARCHING
  // ============================================================================

  linearSearch: {
    title: 'Linear Search',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(n)', space: 'O(1)' },
    description: 'Search each element sequentially',
    code: LINEAR_SEARCH,
  },

  binarySearch: {
    title: 'Binary Search',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(log n)', space: 'O(1)' },
    description: 'Divide and conquer search in sorted array',
    code: BINARY_SEARCH,
  },

  binarySearchRecursive: {
    title: 'Binary Search (Recursive)',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(log n)', space: 'O(log n)' },
    description: 'Recursive binary search with call stack',
    code: BINARY_SEARCH_RECURSIVE,
  },

  // ============================================================================
  // DSA EXAMPLES - RECURSION
  // ============================================================================

  factorial: {
    title: 'Factorial',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(n)', space: 'O(n)' },
    description: 'Classic recursive factorial computation',
    code: FACTORIAL,
  },

  fibonacci: {
    title: 'Fibonacci',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(2^n)', space: 'O(n)' },
    description: 'Recursive Fibonacci with exponential calls',
    code: FIBONACCI,
  },

  power: {
    title: 'Power Function',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(log n)', space: 'O(log n)' },
    description: 'Fast exponentiation using divide and conquer',
    code: POWER,
  },

  sumArray: {
    title: 'Sum Array (Recursive)',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(n)', space: 'O(n)' },
    description: 'Recursive sum of array elements',
    code: SUM_ARRAY,
  },

  // ============================================================================
  // DSA EXAMPLES - TREES
  // ============================================================================

  treeDFS: {
    title: 'Tree DFS Traversals',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(n)', space: 'O(h)' },
    description: 'Inorder and Preorder tree traversals',
    code: TREE_DFS,
  },

  // ============================================================================
  // DSA EXAMPLES - GRAPHS
  // ============================================================================

  graphDFS: {
    title: 'Graph DFS',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(V+E)', space: 'O(V)' },
    description: 'Depth-first graph traversal',
    code: GRAPH_DFS,
  },

  graphBFS: {
    title: 'Graph BFS',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(V+E)', space: 'O(V)' },
    description: 'Breadth-first graph traversal with levels',
    code: GRAPH_BFS,
  },

  // ============================================================================
  // DSA EXAMPLES - BACKTRACKING
  // ============================================================================

  subsets: {
    title: 'Generate Subsets',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(2^n)', space: 'O(n)' },
    description: 'Generate all subsets using backtracking',
    code: SUBSETS,
  },

  permutations: {
    title: 'Generate Permutations',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(n!)', space: 'O(n)' },
    description: 'Generate all permutations using backtracking',
    code: PERMUTATIONS,
  },

  nQueens: {
    title: 'N-Queens',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(n!)', space: 'O(n)' },
    description: 'Solve N-Queens using backtracking',
    code: N_QUEENS,
  },

  // ============================================================================
  // DSA EXAMPLES - STACK & QUEUE
  // ============================================================================

  stackOperations: {
    title: 'Stack Operations',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(1)', space: 'O(n)' },
    description: 'Push, pop, and peek operations on stack',
    code: STACK_OPERATIONS,
  },

  queueOperations: {
    title: 'Queue Operations',
    category: 'dsa',
    mode: 'DSA' as const,
    complexity: { time: 'O(1)', space: 'O(n)' },
    description: 'Enqueue and dequeue operations on queue',
    code: QUEUE_OPERATIONS,
  },

  // ============================================================================
  // BASIC EXAMPLES
  // ============================================================================

  basic: {
    title: 'Basic Variables',
    category: 'basics',
    mode: 'JS_RUNTIME' as const,
    complexity: { time: 'O(1)', space: 'O(1)' },
    description: 'Simple variable declarations and operations',
    code: `let count = 0;
const name = "JavaScript";

count = count + 1;
console.log("Count:", count);

count = count + 1;
console.log("Count:", count);

console.log("Name:", name);`,
  },

  closure: {
    title: 'Closure Counter',
    category: 'scope',
    mode: 'JS_RUNTIME' as const,
    complexity: { time: 'O(1)', space: 'O(1)' },
    description: 'Understanding closures and lexical scope',
    code: `function createCounter() {
  let count = 0;

  return function increment() {
    count = count + 1;
    console.log("Count:", count);
    return count;
  };
}

const counter = createCounter();
counter();
counter();
counter();`,
  },

  scope: {
    title: 'Scope Chain',
    category: 'scope',
    mode: 'JS_RUNTIME' as const,
    complexity: { time: 'O(1)', space: 'O(1)' },
    description: 'How JavaScript resolves variables in nested scopes',
    code: `const globalVar = "global";

function outer() {
  const outerVar = "outer";

  function inner() {
    const innerVar = "inner";
    console.log(innerVar);
    console.log(outerVar);
    console.log(globalVar);
  }

  inner();
}

outer();`,
  },
} as const

export type ExampleKey = keyof typeof EXAMPLE_SNIPPETS

export const EXAMPLE_CATEGORIES = {
  async: { label: 'Event Loop / Async', color: 'orange', mode: 'JS_RUNTIME' as const },
  dsa: { label: 'DSA / Algorithms', color: 'green', mode: 'DSA' as const },
  basics: { label: 'Basics', color: 'blue', mode: 'JS_RUNTIME' as const },
  scope: { label: 'Scope & Closures', color: 'purple', mode: 'JS_RUNTIME' as const },
} as const

/**
 * DSA Examples categorized by algorithm type
 */
export const DSA_EXAMPLES_BY_TYPE = {
  SORTING: ['bubbleSort', 'selectionSort', 'insertionSort', 'quickSort', 'mergeSort'] as const,
  SEARCHING: ['linearSearch', 'binarySearch', 'binarySearchRecursive'] as const,
  RECURSION: ['factorial', 'fibonacci', 'power', 'sumArray'] as const,
  TREES: ['treeDFS'] as const,
  GRAPHS: ['graphDFS', 'graphBFS'] as const,
  BACKTRACKING: ['subsets', 'permutations', 'nQueens'] as const,
  STACK_QUEUE: ['stackOperations', 'queueOperations'] as const,
} as const

/**
 * Get the suggested mode for an example
 */
export function getSuggestedMode(exampleKey: ExampleKey): 'JS_RUNTIME' | 'DSA' {
  const example = EXAMPLE_SNIPPETS[exampleKey]
  return example.mode
}

export const PLAYBACK_SPEEDS = [0.5, 1, 2, 4]

export const MAX_CONSOLE_ENTRIES = 1000
export const MAX_TRACE_EVENTS = 10000
export const MAX_HEAP_OBJECTS = 500

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
}
