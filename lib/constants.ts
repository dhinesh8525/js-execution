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
  // Basic Examples
  basic: {
    title: 'Basic Variables',
    category: 'basics',
    complexity: { time: 'O(1)', space: 'O(1)' },
    description: 'Simple variable declarations and operations',
    code: `// Basic variable declarations
let count = 0;
const name = "JavaScript";

count = count + 1;
console.log("Count:", count);
console.log("Name:", name);
`,
  },
  eventLoop: {
    title: 'Event Loop Demo',
    category: 'async',
    complexity: { time: 'O(1)', space: 'O(n)' },
    description: 'Classic example showing the event loop, task queue, and microtask queue',
    code: `console.log('Start');

setTimeout(() => {
  console.log('Timeout 1');
}, 0);

Promise.resolve().then(() => {
  console.log('Promise 1');
});

setTimeout(() => {
  console.log('Timeout 2');
}, 0);

Promise.resolve().then(() => {
  console.log('Promise 2');
});

console.log('End');`,
  },

  // DSA Examples
  binarySearch: {
    title: 'Binary Search',
    category: 'dsa',
    complexity: { time: 'O(log n)', space: 'O(1)' },
    description: 'Efficient search algorithm for sorted arrays',
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    console.log("Checking index:", mid);

    if (arr[mid] === target) {
      console.log("Found at:", mid);
      return mid;
    }

    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  console.log("Not found");
  return -1;
}

const arr = [1, 3, 5, 7, 9, 11, 13];
binarySearch(arr, 7);
`,
  },
  bubbleSort: {
    title: 'Bubble Sort',
    category: 'dsa',
    complexity: { time: 'O(n²)', space: 'O(1)' },
    description: 'Simple sorting algorithm with nested loops',
    code: `function bubbleSort(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    console.log("Pass", i + 1);

    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        console.log("Swapped:", arr[j], arr[j+1]);
      }
    }
  }

  return arr;
}

const arr = [64, 34, 25, 12, 22];
console.log("Sorted:", bubbleSort(arr));
`,
  },
  fibonacci: {
    title: 'Fibonacci (Recursive)',
    category: 'dsa',
    complexity: { time: 'O(2ⁿ)', space: 'O(n)' },
    description: 'Classic recursive algorithm showing exponential calls',
    code: `function fibonacci(n) {
  console.log("fib(" + n + ")");

  if (n <= 1) {
    return n;
  }

  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(6);
console.log("Result:", result);
`,
  },
  factorial: {
    title: 'Factorial (Recursive)',
    category: 'dsa',
    complexity: { time: 'O(n)', space: 'O(n)' },
    description: 'Recursive function demonstrating call stack growth',
    code: `function factorial(n) {
  console.log("factorial(" + n + ")");

  if (n <= 1) {
    return 1;
  }

  return n * factorial(n - 1);
}

const result = factorial(5);
console.log("Result:", result);
`,
  },
  mergeSort: {
    title: 'Merge Sort',
    category: 'dsa',
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    description: 'Divide and conquer sorting algorithm',
    code: `function mergeSort(arr) {
  console.log("Sorting:", arr);

  if (arr.length <= 1) {
    return arr;
  }

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  const merged = result.concat(left.slice(i)).concat(right.slice(j));
  console.log("Merged:", merged);
  return merged;
}

const arr = [38, 27, 43, 3, 9, 82, 10];
console.log("Result:", mergeSort(arr));
`,
  },
  quickSort: {
    title: 'Quick Sort',
    category: 'dsa',
    complexity: { time: 'O(n log n)', space: 'O(log n)' },
    description: 'Efficient divide and conquer sorting',
    code: `function quickSort(arr, low, high) {
  if (low === undefined) low = 0;
  if (high === undefined) high = arr.length - 1;

  if (low < high) {
    const pi = partition(arr, low, high);
    console.log("Pivot at:", pi, "Array:", arr);

    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }

  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

const arr = [10, 7, 8, 9, 1, 5];
console.log("Sorted:", quickSort(arr));
`,
  },

  // Closure & Scope
  closure: {
    title: 'Closure Counter',
    category: 'scope',
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
counter();
`,
  },
  scope: {
    title: 'Scope Chain',
    category: 'scope',
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

outer();
`,
  },

  // Async
  promises: {
    title: 'Promise Chain',
    category: 'async',
    complexity: { time: 'O(n)', space: 'O(n)' },
    description: 'Promise chaining and microtask queue',
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
`,
  },

  // Data Structures
  linkedList: {
    title: 'Linked List Traversal',
    category: 'dsa',
    complexity: { time: 'O(n)', space: 'O(1)' },
    description: 'Traversing a linked list data structure',
    code: `// Create a simple linked list
function Node(value) {
  this.value = value;
  this.next = null;
}

function traverse(head) {
  let current = head;
  let step = 1;

  while (current !== null) {
    console.log("Step " + step + ": " + current.value);
    current = current.next;
    step++;
  }
}

// Build list: 1 -> 2 -> 3 -> 4
const head = new Node(1);
head.next = new Node(2);
head.next.next = new Node(3);
head.next.next.next = new Node(4);

traverse(head);
`,
  },
  twoSum: {
    title: 'Two Sum (Hash Map)',
    category: 'dsa',
    complexity: { time: 'O(n)', space: 'O(n)' },
    description: 'Classic interview problem using hash map',
    code: `function twoSum(nums, target) {
  const map = {};

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    console.log("Checking:", nums[i], "Need:", complement);

    if (map[complement] !== undefined) {
      console.log("Found pair!");
      return [map[complement], i];
    }

    map[nums[i]] = i;
  }

  return [];
}

const nums = [2, 7, 11, 15];
const result = twoSum(nums, 9);
console.log("Result:", result);
`,
  },
} as const

export type ExampleKey = keyof typeof EXAMPLE_SNIPPETS

export const EXAMPLE_CATEGORIES = {
  basics: { label: 'Basics', color: 'blue' },
  dsa: { label: 'DSA / Algorithms', color: 'green' },
  scope: { label: 'Scope & Closures', color: 'purple' },
  async: { label: 'Async / Event Loop', color: 'orange' },
} as const

export const PLAYBACK_SPEEDS = [0.5, 1, 2, 4]

export const MAX_CONSOLE_ENTRIES = 1000
export const MAX_TRACE_EVENTS = 10000
export const MAX_HEAP_OBJECTS = 500

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
}
