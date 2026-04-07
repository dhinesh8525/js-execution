/**
 * DSA Algorithms Library
 *
 * Real algorithm implementations with trace instrumentation.
 * Each algorithm uses trace() to emit visualization events.
 *
 * TRACE EVENT FORMAT:
 * {
 *   step: number,
 *   category: 'ARRAY' | 'STACK' | 'QUEUE' | 'TREE' | 'GRAPH' | 'RECURSION' | 'DP',
 *   action: string,
 *   payload: object,
 *   snapshot: { array?, variables?, callStack?, pointers? }
 * }
 */

// =============================================================================
// SORTING ALGORITHMS
// =============================================================================

export const BUBBLE_SORT = `
function bubbleSort(arr) {
  const n = arr.length;

  trace({
    category: 'ARRAY',
    action: 'INIT',
    payload: { message: 'Starting Bubble Sort' },
    snapshot: { array: [...arr] }
  });

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    trace({
      category: 'ARRAY',
      action: 'PASS_START',
      payload: { pass: i + 1, message: \`Pass \${i + 1}: Bubbling largest to position \${n - 1 - i}\` },
      snapshot: { array: [...arr], variables: { i, swapped } }
    });

    for (let j = 0; j < n - i - 1; j++) {
      trace({
        category: 'ARRAY',
        action: 'COMPARE',
        payload: {
          indices: [j, j + 1],
          values: [arr[j], arr[j + 1]],
          message: \`Compare arr[\${j}]=\${arr[j]} with arr[\${j + 1}]=\${arr[j + 1]}\`
        },
        snapshot: { array: [...arr], variables: { i, j }, pointers: { j, 'j+1': j + 1 } }
      });

      if (arr[j] > arr[j + 1]) {
        trace({
          category: 'ARRAY',
          action: 'SWAP',
          payload: {
            indices: [j, j + 1],
            values: [arr[j], arr[j + 1]],
            message: \`Swap \${arr[j]} and \${arr[j + 1]}\`
          },
          snapshot: { array: [...arr], variables: { i, j } }
        });

        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }

    trace({
      category: 'ARRAY',
      action: 'SORTED',
      payload: { index: n - 1 - i, message: \`Element at position \${n - 1 - i} is now sorted\` },
      snapshot: { array: [...arr], variables: { i, swapped } }
    });

    if (!swapped) {
      trace({
        category: 'ARRAY',
        action: 'EARLY_EXIT',
        payload: { message: 'No swaps needed - array is sorted!' },
        snapshot: { array: [...arr] }
      });
      break;
    }
  }

  trace({
    category: 'ARRAY',
    action: 'COMPLETE',
    payload: { message: 'Bubble Sort complete!' },
    snapshot: { array: [...arr] }
  });

  return arr;
}

// Run with sample input
bubbleSort([64, 34, 25, 12, 22, 11, 90]);
`;

export const SELECTION_SORT = `
function selectionSort(arr) {
  const n = arr.length;

  trace({
    category: 'ARRAY',
    action: 'INIT',
    payload: { message: 'Starting Selection Sort' },
    snapshot: { array: [...arr] }
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    trace({
      category: 'ARRAY',
      action: 'PASS_START',
      payload: { pass: i + 1, message: \`Finding minimum for position \${i}\` },
      snapshot: { array: [...arr], variables: { i, minIdx }, pointers: { i, minIdx } }
    });

    for (let j = i + 1; j < n; j++) {
      trace({
        category: 'ARRAY',
        action: 'COMPARE',
        payload: {
          indices: [j, minIdx],
          values: [arr[j], arr[minIdx]],
          message: \`Compare arr[\${j}]=\${arr[j]} with min arr[\${minIdx}]=\${arr[minIdx]}\`
        },
        snapshot: { array: [...arr], variables: { i, j, minIdx }, pointers: { i, j, minIdx } }
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        trace({
          category: 'ARRAY',
          action: 'UPDATE_MIN',
          payload: { index: minIdx, value: arr[minIdx], message: \`New minimum found: \${arr[minIdx]} at index \${minIdx}\` },
          snapshot: { array: [...arr], variables: { i, j, minIdx }, pointers: { i, minIdx } }
        });
      }
    }

    if (minIdx !== i) {
      trace({
        category: 'ARRAY',
        action: 'SWAP',
        payload: {
          indices: [i, minIdx],
          values: [arr[i], arr[minIdx]],
          message: \`Swap arr[\${i}]=\${arr[i]} with arr[\${minIdx}]=\${arr[minIdx]}\`
        },
        snapshot: { array: [...arr], variables: { i, minIdx } }
      });

      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }

    trace({
      category: 'ARRAY',
      action: 'SORTED',
      payload: { index: i, message: \`Position \${i} is now sorted with value \${arr[i]}\` },
      snapshot: { array: [...arr] }
    });
  }

  trace({
    category: 'ARRAY',
    action: 'COMPLETE',
    payload: { message: 'Selection Sort complete!' },
    snapshot: { array: [...arr] }
  });

  return arr;
}

selectionSort([64, 25, 12, 22, 11]);
`;

export const INSERTION_SORT = `
function insertionSort(arr) {
  const n = arr.length;

  trace({
    category: 'ARRAY',
    action: 'INIT',
    payload: { message: 'Starting Insertion Sort' },
    snapshot: { array: [...arr] }
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    trace({
      category: 'ARRAY',
      action: 'SELECT_KEY',
      payload: { index: i, key, message: \`Insert key=\${key} into sorted portion [0..\${i-1}]\` },
      snapshot: { array: [...arr], variables: { i, key, j }, pointers: { i } }
    });

    while (j >= 0 && arr[j] > key) {
      trace({
        category: 'ARRAY',
        action: 'COMPARE',
        payload: {
          indices: [j, i],
          values: [arr[j], key],
          message: \`arr[\${j}]=\${arr[j]} > key=\${key}, shift right\`
        },
        snapshot: { array: [...arr], variables: { i, key, j }, pointers: { j, insertPos: j + 1 } }
      });

      trace({
        category: 'ARRAY',
        action: 'SHIFT',
        payload: { from: j, to: j + 1, value: arr[j], message: \`Shift \${arr[j]} to position \${j + 1}\` },
        snapshot: { array: [...arr], variables: { i, key, j } }
      });

      arr[j + 1] = arr[j];
      j--;
    }

    arr[j + 1] = key;

    trace({
      category: 'ARRAY',
      action: 'INSERT',
      payload: { index: j + 1, value: key, message: \`Insert key=\${key} at position \${j + 1}\` },
      snapshot: { array: [...arr], variables: { i, key } }
    });
  }

  trace({
    category: 'ARRAY',
    action: 'COMPLETE',
    payload: { message: 'Insertion Sort complete!' },
    snapshot: { array: [...arr] }
  });

  return arr;
}

insertionSort([12, 11, 13, 5, 6]);
`;

export const QUICK_SORT = `
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low === 0 && high === arr.length - 1) {
    trace({
      category: 'ARRAY',
      action: 'INIT',
      payload: { message: 'Starting Quick Sort' },
      snapshot: { array: [...arr] }
    });
  }

  trace({
    category: 'RECURSION',
    action: 'CALL',
    payload: { function: 'quickSort', args: { low, high }, message: \`quickSort(arr, \${low}, \${high})\` },
    snapshot: { array: [...arr], variables: { low, high } }
  });

  if (low < high) {
    const pivotIdx = partition(arr, low, high);

    trace({
      category: 'ARRAY',
      action: 'PARTITION_DONE',
      payload: { pivotIdx, pivotValue: arr[pivotIdx], message: \`Pivot \${arr[pivotIdx]} placed at index \${pivotIdx}\` },
      snapshot: { array: [...arr], variables: { low, high, pivotIdx } }
    });

    quickSort(arr, low, pivotIdx - 1);
    quickSort(arr, pivotIdx + 1, high);
  }

  trace({
    category: 'RECURSION',
    action: 'RETURN',
    payload: { function: 'quickSort', message: \`Return from quickSort(\${low}, \${high})\` },
    snapshot: { array: [...arr] }
  });

  if (low === 0 && high === arr.length - 1) {
    trace({
      category: 'ARRAY',
      action: 'COMPLETE',
      payload: { message: 'Quick Sort complete!' },
      snapshot: { array: [...arr] }
    });
  }

  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;

  trace({
    category: 'ARRAY',
    action: 'PARTITION_START',
    payload: { low, high, pivot, message: \`Partitioning [\${low}..\${high}] with pivot=\${pivot}\` },
    snapshot: { array: [...arr], variables: { low, high, pivot, i }, pointers: { pivot: high } }
  });

  for (let j = low; j < high; j++) {
    trace({
      category: 'ARRAY',
      action: 'COMPARE',
      payload: {
        indices: [j, high],
        values: [arr[j], pivot],
        message: \`Compare arr[\${j}]=\${arr[j]} with pivot=\${pivot}\`
      },
      snapshot: { array: [...arr], variables: { i, j, pivot }, pointers: { i: i + 1, j, pivot: high } }
    });

    if (arr[j] <= pivot) {
      i++;
      if (i !== j) {
        trace({
          category: 'ARRAY',
          action: 'SWAP',
          payload: { indices: [i, j], values: [arr[i], arr[j]], message: \`Swap arr[\${i}]=\${arr[i]} with arr[\${j}]=\${arr[j]}\` },
          snapshot: { array: [...arr], variables: { i, j } }
        });
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  }

  trace({
    category: 'ARRAY',
    action: 'SWAP',
    payload: { indices: [i + 1, high], values: [arr[i + 1], arr[high]], message: \`Place pivot: swap arr[\${i + 1}]=\${arr[i + 1]} with arr[\${high}]=\${arr[high]}\` },
    snapshot: { array: [...arr] }
  });

  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

  return i + 1;
}

quickSort([10, 7, 8, 9, 1, 5]);
`;

export const MERGE_SORT = `
function mergeSort(arr, left = 0, right = arr.length - 1) {
  if (left === 0 && right === arr.length - 1) {
    trace({
      category: 'ARRAY',
      action: 'INIT',
      payload: { message: 'Starting Merge Sort' },
      snapshot: { array: [...arr] }
    });
  }

  trace({
    category: 'RECURSION',
    action: 'CALL',
    payload: { function: 'mergeSort', args: { left, right }, message: \`mergeSort([\${left}..\${right}])\` },
    snapshot: { array: [...arr], variables: { left, right } }
  });

  if (left < right) {
    const mid = Math.floor((left + right) / 2);

    trace({
      category: 'ARRAY',
      action: 'DIVIDE',
      payload: { left, mid, right, message: \`Divide at mid=\${mid}: [\${left}..\${mid}] and [\${mid + 1}..\${right}]\` },
      snapshot: { array: [...arr], variables: { left, mid, right } }
    });

    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
  }

  trace({
    category: 'RECURSION',
    action: 'RETURN',
    payload: { function: 'mergeSort', message: \`Return from mergeSort([\${left}..\${right}])\` },
    snapshot: { array: [...arr] }
  });

  if (left === 0 && right === arr.length - 1) {
    trace({
      category: 'ARRAY',
      action: 'COMPLETE',
      payload: { message: 'Merge Sort complete!' },
      snapshot: { array: [...arr] }
    });
  }

  return arr;
}

function merge(arr, left, mid, right) {
  const leftArr = arr.slice(left, mid + 1);
  const rightArr = arr.slice(mid + 1, right + 1);

  trace({
    category: 'ARRAY',
    action: 'MERGE_START',
    payload: { left, mid, right, leftArr: [...leftArr], rightArr: [...rightArr], message: \`Merging [\${leftArr}] and [\${rightArr}]\` },
    snapshot: { array: [...arr], variables: { left, mid, right } }
  });

  let i = 0, j = 0, k = left;

  while (i < leftArr.length && j < rightArr.length) {
    trace({
      category: 'ARRAY',
      action: 'COMPARE',
      payload: { values: [leftArr[i], rightArr[j]], message: \`Compare \${leftArr[i]} with \${rightArr[j]}\` },
      snapshot: { array: [...arr], variables: { i, j, k } }
    });

    if (leftArr[i] <= rightArr[j]) {
      arr[k] = leftArr[i];
      trace({
        category: 'ARRAY',
        action: 'SET',
        payload: { index: k, value: leftArr[i], message: \`Place \${leftArr[i]} at position \${k}\` },
        snapshot: { array: [...arr], variables: { i, j, k } }
      });
      i++;
    } else {
      arr[k] = rightArr[j];
      trace({
        category: 'ARRAY',
        action: 'SET',
        payload: { index: k, value: rightArr[j], message: \`Place \${rightArr[j]} at position \${k}\` },
        snapshot: { array: [...arr], variables: { i, j, k } }
      });
      j++;
    }
    k++;
  }

  while (i < leftArr.length) {
    arr[k] = leftArr[i];
    trace({
      category: 'ARRAY',
      action: 'SET',
      payload: { index: k, value: leftArr[i], message: \`Copy remaining \${leftArr[i]} to position \${k}\` },
      snapshot: { array: [...arr] }
    });
    i++;
    k++;
  }

  while (j < rightArr.length) {
    arr[k] = rightArr[j];
    trace({
      category: 'ARRAY',
      action: 'SET',
      payload: { index: k, value: rightArr[j], message: \`Copy remaining \${rightArr[j]} to position \${k}\` },
      snapshot: { array: [...arr] }
    });
    j++;
    k++;
  }

  trace({
    category: 'ARRAY',
    action: 'MERGE_DONE',
    payload: { left, right, message: \`Merged: [\${arr.slice(left, right + 1)}]\` },
    snapshot: { array: [...arr] }
  });
}

mergeSort([38, 27, 43, 3, 9, 82, 10]);
`;

// =============================================================================
// SEARCHING ALGORITHMS
// =============================================================================

export const LINEAR_SEARCH = `
function linearSearch(arr, target) {
  trace({
    category: 'ARRAY',
    action: 'INIT',
    payload: { target, message: \`Linear Search for target=\${target}\` },
    snapshot: { array: [...arr], variables: { target } }
  });

  for (let i = 0; i < arr.length; i++) {
    trace({
      category: 'ARRAY',
      action: 'ACCESS',
      payload: { index: i, value: arr[i], message: \`Check arr[\${i}]=\${arr[i]}\` },
      snapshot: { array: [...arr], variables: { i, target }, pointers: { i } }
    });

    trace({
      category: 'ARRAY',
      action: 'COMPARE',
      payload: { indices: [i], values: [arr[i], target], message: \`Is \${arr[i]} === \${target}?\` },
      snapshot: { array: [...arr], variables: { i, target } }
    });

    if (arr[i] === target) {
      trace({
        category: 'ARRAY',
        action: 'FOUND',
        payload: { index: i, value: arr[i], message: \`Found \${target} at index \${i}!\` },
        snapshot: { array: [...arr], variables: { i, target } }
      });
      return i;
    }
  }

  trace({
    category: 'ARRAY',
    action: 'NOT_FOUND',
    payload: { target, message: \`\${target} not found in array\` },
    snapshot: { array: [...arr], variables: { target } }
  });

  return -1;
}

linearSearch([10, 25, 33, 47, 58, 69], 47);
`;

export const BINARY_SEARCH = `
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  trace({
    category: 'ARRAY',
    action: 'INIT',
    payload: { target, message: \`Binary Search for target=\${target} in sorted array\` },
    snapshot: { array: [...arr], variables: { target, left, right } }
  });

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    trace({
      category: 'ARRAY',
      action: 'CALCULATE_MID',
      payload: { left, right, mid, message: \`mid = (\${left} + \${right}) / 2 = \${mid}\` },
      snapshot: { array: [...arr], variables: { left, right, mid }, pointers: { left, mid, right } }
    });

    trace({
      category: 'ARRAY',
      action: 'COMPARE',
      payload: {
        indices: [mid],
        values: [arr[mid], target],
        message: \`Compare arr[\${mid}]=\${arr[mid]} with target=\${target}\`
      },
      snapshot: { array: [...arr], variables: { left, right, mid, target }, pointers: { left, mid, right } }
    });

    if (arr[mid] === target) {
      trace({
        category: 'ARRAY',
        action: 'FOUND',
        payload: { index: mid, value: arr[mid], message: \`Found \${target} at index \${mid}!\` },
        snapshot: { array: [...arr], variables: { mid } }
      });
      return mid;
    }

    if (arr[mid] < target) {
      trace({
        category: 'ARRAY',
        action: 'SEARCH_RIGHT',
        payload: { message: \`\${arr[mid]} < \${target}, search right half\` },
        snapshot: { array: [...arr], variables: { left: mid + 1, right } }
      });
      left = mid + 1;
    } else {
      trace({
        category: 'ARRAY',
        action: 'SEARCH_LEFT',
        payload: { message: \`\${arr[mid]} > \${target}, search left half\` },
        snapshot: { array: [...arr], variables: { left, right: mid - 1 } }
      });
      right = mid - 1;
    }
  }

  trace({
    category: 'ARRAY',
    action: 'NOT_FOUND',
    payload: { target, message: \`\${target} not found in array\` },
    snapshot: { array: [...arr], variables: { target } }
  });

  return -1;
}

binarySearch([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23);
`;

export const BINARY_SEARCH_RECURSIVE = `
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
  if (left === 0 && right === arr.length - 1) {
    trace({
      category: 'ARRAY',
      action: 'INIT',
      payload: { target, message: \`Recursive Binary Search for target=\${target}\` },
      snapshot: { array: [...arr], variables: { target } }
    });
  }

  trace({
    category: 'RECURSION',
    action: 'CALL',
    payload: { function: 'binarySearch', args: { left, right }, message: \`binarySearch(arr, \${target}, \${left}, \${right})\` },
    snapshot: { array: [...arr], variables: { left, right, target }, pointers: { left, right } }
  });

  if (left > right) {
    trace({
      category: 'RECURSION',
      action: 'RETURN',
      payload: { value: -1, message: 'Base case: left > right, return -1' },
      snapshot: { array: [...arr] }
    });
    return -1;
  }

  const mid = Math.floor((left + right) / 2);

  trace({
    category: 'ARRAY',
    action: 'COMPARE',
    payload: {
      indices: [mid],
      values: [arr[mid], target],
      message: \`Compare arr[\${mid}]=\${arr[mid]} with \${target}\`
    },
    snapshot: { array: [...arr], variables: { left, right, mid }, pointers: { left, mid, right } }
  });

  if (arr[mid] === target) {
    trace({
      category: 'RECURSION',
      action: 'RETURN',
      payload: { value: mid, message: \`Found! Return \${mid}\` },
      snapshot: { array: [...arr] }
    });
    return mid;
  }

  if (arr[mid] < target) {
    trace({
      category: 'ARRAY',
      action: 'SEARCH_RIGHT',
      payload: { message: \`\${arr[mid]} < \${target}, recurse on right half\` },
      snapshot: { array: [...arr] }
    });
    const result = binarySearchRecursive(arr, target, mid + 1, right);
    trace({
      category: 'RECURSION',
      action: 'RETURN',
      payload: { value: result, message: \`Return \${result}\` },
      snapshot: { array: [...arr] }
    });
    return result;
  } else {
    trace({
      category: 'ARRAY',
      action: 'SEARCH_LEFT',
      payload: { message: \`\${arr[mid]} > \${target}, recurse on left half\` },
      snapshot: { array: [...arr] }
    });
    const result = binarySearchRecursive(arr, target, left, mid - 1);
    trace({
      category: 'RECURSION',
      action: 'RETURN',
      payload: { value: result, message: \`Return \${result}\` },
      snapshot: { array: [...arr] }
    });
    return result;
  }
}

binarySearchRecursive([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 13);
`;

// =============================================================================
// RECURSION ALGORITHMS
// =============================================================================

export const FACTORIAL = `
function factorial(n) {
  trace({
    category: 'RECURSION',
    action: 'CALL',
    payload: { function: 'factorial', args: { n }, message: \`factorial(\${n})\` },
    snapshot: { variables: { n } }
  });

  if (n <= 1) {
    trace({
      category: 'RECURSION',
      action: 'BASE_CASE',
      payload: { n, result: 1, message: \`Base case: factorial(\${n}) = 1\` },
      snapshot: { variables: { n } }
    });

    trace({
      category: 'RECURSION',
      action: 'RETURN',
      payload: { value: 1, message: 'Return 1' },
      snapshot: { variables: { n } }
    });
    return 1;
  }

  trace({
    category: 'RECURSION',
    action: 'RECURSE',
    payload: { message: \`\${n} * factorial(\${n - 1})\` },
    snapshot: { variables: { n } }
  });

  const result = n * factorial(n - 1);

  trace({
    category: 'RECURSION',
    action: 'RETURN',
    payload: { value: result, message: \`Return \${n} * ... = \${result}\` },
    snapshot: { variables: { n, result } }
  });

  return result;
}

const result = factorial(5);
trace({
  category: 'RECURSION',
  action: 'COMPLETE',
  payload: { result, message: \`factorial(5) = \${result}\` },
  snapshot: { variables: { result } }
});
`;

export const FIBONACCI = `
function fibonacci(n) {
  trace({
    category: 'RECURSION',
    action: 'CALL',
    payload: { function: 'fibonacci', args: { n }, message: \`fib(\${n})\` },
    snapshot: { variables: { n } }
  });

  if (n <= 1) {
    trace({
      category: 'RECURSION',
      action: 'BASE_CASE',
      payload: { n, result: n, message: \`Base case: fib(\${n}) = \${n}\` },
      snapshot: { variables: { n } }
    });

    trace({
      category: 'RECURSION',
      action: 'RETURN',
      payload: { value: n, message: \`Return \${n}\` },
      snapshot: { variables: { n } }
    });
    return n;
  }

  trace({
    category: 'RECURSION',
    action: 'RECURSE',
    payload: { message: \`fib(\${n - 1}) + fib(\${n - 2})\` },
    snapshot: { variables: { n } }
  });

  const left = fibonacci(n - 1);
  const right = fibonacci(n - 2);
  const result = left + right;

  trace({
    category: 'RECURSION',
    action: 'RETURN',
    payload: { value: result, message: \`Return fib(\${n - 1}) + fib(\${n - 2}) = \${left} + \${right} = \${result}\` },
    snapshot: { variables: { n, left, right, result } }
  });

  return result;
}

const result = fibonacci(5);
trace({
  category: 'RECURSION',
  action: 'COMPLETE',
  payload: { result, message: \`fibonacci(5) = \${result}\` },
  snapshot: { variables: { result } }
});
`;

export const POWER = `
function power(base, exp) {
  trace({
    category: 'RECURSION',
    action: 'CALL',
    payload: { function: 'power', args: { base, exp }, message: \`power(\${base}, \${exp})\` },
    snapshot: { variables: { base, exp } }
  });

  if (exp === 0) {
    trace({
      category: 'RECURSION',
      action: 'BASE_CASE',
      payload: { result: 1, message: \`Base case: \${base}^0 = 1\` },
      snapshot: { variables: { base, exp } }
    });

    trace({
      category: 'RECURSION',
      action: 'RETURN',
      payload: { value: 1, message: 'Return 1' },
      snapshot: {}
    });
    return 1;
  }

  if (exp % 2 === 0) {
    trace({
      category: 'RECURSION',
      action: 'RECURSE',
      payload: { message: \`\${exp} is even: power(\${base}, \${exp / 2})^2\` },
      snapshot: { variables: { base, exp } }
    });

    const half = power(base, exp / 2);
    const result = half * half;

    trace({
      category: 'RECURSION',
      action: 'RETURN',
      payload: { value: result, message: \`Return \${half}^2 = \${result}\` },
      snapshot: { variables: { half, result } }
    });
    return result;
  } else {
    trace({
      category: 'RECURSION',
      action: 'RECURSE',
      payload: { message: \`\${exp} is odd: \${base} * power(\${base}, \${exp - 1})\` },
      snapshot: { variables: { base, exp } }
    });

    const sub = power(base, exp - 1);
    const result = base * sub;

    trace({
      category: 'RECURSION',
      action: 'RETURN',
      payload: { value: result, message: \`Return \${base} * \${sub} = \${result}\` },
      snapshot: { variables: { sub, result } }
    });
    return result;
  }
}

const result = power(2, 8);
trace({
  category: 'RECURSION',
  action: 'COMPLETE',
  payload: { result, message: \`power(2, 8) = \${result}\` },
  snapshot: { variables: { result } }
});
`;

export const SUM_ARRAY = `
function sumArray(arr, index = 0) {
  trace({
    category: 'RECURSION',
    action: 'CALL',
    payload: { function: 'sumArray', args: { index }, message: \`sumArray(arr, \${index})\` },
    snapshot: { array: [...arr], variables: { index } }
  });

  if (index >= arr.length) {
    trace({
      category: 'RECURSION',
      action: 'BASE_CASE',
      payload: { result: 0, message: 'Base case: reached end of array, return 0' },
      snapshot: { array: [...arr], variables: { index } }
    });

    trace({
      category: 'RECURSION',
      action: 'RETURN',
      payload: { value: 0, message: 'Return 0' },
      snapshot: {}
    });
    return 0;
  }

  trace({
    category: 'ARRAY',
    action: 'ACCESS',
    payload: { index, value: arr[index], message: \`Access arr[\${index}] = \${arr[index]}\` },
    snapshot: { array: [...arr], variables: { index }, pointers: { index } }
  });

  trace({
    category: 'RECURSION',
    action: 'RECURSE',
    payload: { message: \`\${arr[index]} + sumArray(arr, \${index + 1})\` },
    snapshot: { array: [...arr], variables: { index } }
  });

  const restSum = sumArray(arr, index + 1);
  const result = arr[index] + restSum;

  trace({
    category: 'RECURSION',
    action: 'RETURN',
    payload: { value: result, message: \`Return \${arr[index]} + \${restSum} = \${result}\` },
    snapshot: { array: [...arr], variables: { index, restSum, result } }
  });

  return result;
}

const result = sumArray([5, 3, 8, 2, 7]);
trace({
  category: 'RECURSION',
  action: 'COMPLETE',
  payload: { result, message: \`Sum of array = \${result}\` },
  snapshot: { variables: { result } }
});
`;

// =============================================================================
// TREE ALGORITHMS
// =============================================================================

export const TREE_DFS = `
// Binary tree node structure
const tree = {
  val: 4,
  left: {
    val: 2,
    left: { val: 1, left: null, right: null },
    right: { val: 3, left: null, right: null }
  },
  right: {
    val: 6,
    left: { val: 5, left: null, right: null },
    right: { val: 7, left: null, right: null }
  }
};

const inorderResult = [];
const preorderResult = [];
const postorderResult = [];

function inorder(node) {
  trace({
    category: 'TREE',
    action: 'CALL',
    payload: { function: 'inorder', node: node?.val ?? 'null', message: \`inorder(\${node?.val ?? 'null'})\` },
    snapshot: { variables: { currentNode: node?.val } }
  });

  if (node === null) {
    trace({
      category: 'TREE',
      action: 'RETURN',
      payload: { message: 'Node is null, return' },
      snapshot: {}
    });
    return;
  }

  inorder(node.left);

  trace({
    category: 'TREE',
    action: 'VISIT',
    payload: { value: node.val, message: \`Visit node \${node.val}\` },
    snapshot: { variables: { visiting: node.val } }
  });
  inorderResult.push(node.val);

  inorder(node.right);

  trace({
    category: 'TREE',
    action: 'RETURN',
    payload: { message: \`Return from node \${node.val}\` },
    snapshot: {}
  });
}

function preorder(node) {
  trace({
    category: 'TREE',
    action: 'CALL',
    payload: { function: 'preorder', node: node?.val ?? 'null', message: \`preorder(\${node?.val ?? 'null'})\` },
    snapshot: { variables: { currentNode: node?.val } }
  });

  if (node === null) {
    trace({
      category: 'TREE',
      action: 'RETURN',
      payload: { message: 'Node is null, return' },
      snapshot: {}
    });
    return;
  }

  trace({
    category: 'TREE',
    action: 'VISIT',
    payload: { value: node.val, message: \`Visit node \${node.val}\` },
    snapshot: { variables: { visiting: node.val } }
  });
  preorderResult.push(node.val);

  preorder(node.left);
  preorder(node.right);

  trace({
    category: 'TREE',
    action: 'RETURN',
    payload: { message: \`Return from node \${node.val}\` },
    snapshot: {}
  });
}

trace({
  category: 'TREE',
  action: 'INIT',
  payload: { message: 'Tree DFS Traversals' },
  snapshot: { tree: '4 -> (2 -> (1, 3), 6 -> (5, 7))' }
});

trace({
  category: 'TREE',
  action: 'START_TRAVERSAL',
  payload: { type: 'INORDER', message: '--- INORDER (Left, Root, Right) ---' },
  snapshot: {}
});

inorder(tree);

trace({
  category: 'TREE',
  action: 'TRAVERSAL_COMPLETE',
  payload: { result: inorderResult, message: \`Inorder: [\${inorderResult}]\` },
  snapshot: { variables: { inorder: inorderResult } }
});

trace({
  category: 'TREE',
  action: 'START_TRAVERSAL',
  payload: { type: 'PREORDER', message: '--- PREORDER (Root, Left, Right) ---' },
  snapshot: {}
});

preorder(tree);

trace({
  category: 'TREE',
  action: 'TRAVERSAL_COMPLETE',
  payload: { result: preorderResult, message: \`Preorder: [\${preorderResult}]\` },
  snapshot: { variables: { preorder: preorderResult } }
});
`;

// =============================================================================
// GRAPH ALGORITHMS
// =============================================================================

export const GRAPH_DFS = `
// Graph represented as adjacency list
const graph = {
  0: [1, 2],
  1: [0, 3, 4],
  2: [0, 4],
  3: [1],
  4: [1, 2, 5],
  5: [4]
};

const visited = new Set();
const result = [];

function dfs(node) {
  trace({
    category: 'GRAPH',
    action: 'CALL',
    payload: { function: 'dfs', node, message: \`dfs(\${node})\` },
    snapshot: { variables: { node, visited: Array.from(visited) } }
  });

  if (visited.has(node)) {
    trace({
      category: 'GRAPH',
      action: 'SKIP',
      payload: { node, message: \`Node \${node} already visited, skip\` },
      snapshot: { variables: { visited: Array.from(visited) } }
    });
    trace({
      category: 'GRAPH',
      action: 'RETURN',
      payload: { message: 'Return (already visited)' },
      snapshot: {}
    });
    return;
  }

  trace({
    category: 'GRAPH',
    action: 'VISIT',
    payload: { node, message: \`Visit node \${node}\` },
    snapshot: { variables: { node, visited: Array.from(visited) } }
  });

  visited.add(node);
  result.push(node);

  const neighbors = graph[node];
  trace({
    category: 'GRAPH',
    action: 'EXPLORE_NEIGHBORS',
    payload: { node, neighbors, message: \`Explore neighbors of \${node}: [\${neighbors}]\` },
    snapshot: { variables: { neighbors } }
  });

  for (const neighbor of neighbors) {
    trace({
      category: 'GRAPH',
      action: 'CHECK_NEIGHBOR',
      payload: { from: node, to: neighbor, message: \`Check neighbor \${neighbor}\` },
      snapshot: { variables: { node, neighbor, visited: Array.from(visited) } }
    });

    dfs(neighbor);
  }

  trace({
    category: 'GRAPH',
    action: 'RETURN',
    payload: { message: \`Backtrack from node \${node}\` },
    snapshot: { variables: { visited: Array.from(visited) } }
  });
}

trace({
  category: 'GRAPH',
  action: 'INIT',
  payload: { message: 'Graph DFS from node 0' },
  snapshot: { graph: '0-1-3, 0-2-4-5' }
});

dfs(0);

trace({
  category: 'GRAPH',
  action: 'COMPLETE',
  payload: { result, message: \`DFS traversal: [\${result}]\` },
  snapshot: { variables: { result } }
});
`;

export const GRAPH_BFS = `
// Graph represented as adjacency list
const graph = {
  0: [1, 2],
  1: [0, 3, 4],
  2: [0, 4],
  3: [1],
  4: [1, 2, 5],
  5: [4]
};

function bfs(start) {
  const visited = new Set();
  const queue = [start];
  const result = [];
  let level = 0;

  trace({
    category: 'GRAPH',
    action: 'INIT',
    payload: { start, message: \`BFS starting from node \${start}\` },
    snapshot: { variables: { queue: [...queue], visited: [] } }
  });

  visited.add(start);

  while (queue.length > 0) {
    const levelSize = queue.length;

    trace({
      category: 'GRAPH',
      action: 'LEVEL_START',
      payload: { level, size: levelSize, message: \`Processing level \${level} with \${levelSize} nodes\` },
      snapshot: { variables: { level, queue: [...queue], visited: Array.from(visited) } }
    });

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();

      trace({
        category: 'QUEUE',
        action: 'DEQUEUE',
        payload: { value: node, message: \`Dequeue node \${node}\` },
        snapshot: { variables: { node, queue: [...queue] } }
      });

      trace({
        category: 'GRAPH',
        action: 'VISIT',
        payload: { node, level, message: \`Visit node \${node} at level \${level}\` },
        snapshot: { variables: { node, level } }
      });

      result.push(node);

      const neighbors = graph[node];
      trace({
        category: 'GRAPH',
        action: 'EXPLORE_NEIGHBORS',
        payload: { node, neighbors, message: \`Check neighbors of \${node}: [\${neighbors}]\` },
        snapshot: { variables: { node, neighbors } }
      });

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          trace({
            category: 'QUEUE',
            action: 'ENQUEUE',
            payload: { value: neighbor, message: \`Enqueue unvisited neighbor \${neighbor}\` },
            snapshot: { variables: { queue: [...queue, neighbor] } }
          });

          visited.add(neighbor);
          queue.push(neighbor);
        } else {
          trace({
            category: 'GRAPH',
            action: 'SKIP',
            payload: { node: neighbor, message: \`Skip visited neighbor \${neighbor}\` },
            snapshot: {}
          });
        }
      }
    }

    level++;
  }

  trace({
    category: 'GRAPH',
    action: 'COMPLETE',
    payload: { result, message: \`BFS traversal: [\${result}]\` },
    snapshot: { variables: { result } }
  });

  return result;
}

bfs(0);
`;

// =============================================================================
// BACKTRACKING ALGORITHMS
// =============================================================================

export const SUBSETS = `
function generateSubsets(arr) {
  const result = [];

  trace({
    category: 'RECURSION',
    action: 'INIT',
    payload: { array: arr, message: \`Generate all subsets of [\${arr}]\` },
    snapshot: { array: [...arr] }
  });

  function backtrack(index, current) {
    trace({
      category: 'RECURSION',
      action: 'CALL',
      payload: { function: 'backtrack', args: { index, current: [...current] }, message: \`backtrack(\${index}, [\${current}])\` },
      snapshot: { variables: { index, current: [...current] } }
    });

    if (index === arr.length) {
      trace({
        category: 'RECURSION',
        action: 'OUTPUT',
        payload: { subset: [...current], message: \`Output subset: [\${current}]\` },
        snapshot: { variables: { current: [...current] } }
      });
      result.push([...current]);

      trace({
        category: 'RECURSION',
        action: 'RETURN',
        payload: { message: 'Base case reached, return' },
        snapshot: {}
      });
      return;
    }

    // Exclude current element
    trace({
      category: 'RECURSION',
      action: 'CHOICE',
      payload: { choice: 'EXCLUDE', element: arr[index], message: \`Exclude \${arr[index]}\` },
      snapshot: { variables: { index, element: arr[index] } }
    });

    backtrack(index + 1, current);

    // Include current element
    trace({
      category: 'RECURSION',
      action: 'CHOICE',
      payload: { choice: 'INCLUDE', element: arr[index], message: \`Include \${arr[index]}\` },
      snapshot: { variables: { index, element: arr[index] } }
    });

    current.push(arr[index]);
    backtrack(index + 1, current);

    trace({
      category: 'RECURSION',
      action: 'BACKTRACK',
      payload: { removed: current.pop(), message: \`Backtrack: remove \${arr[index]}\` },
      snapshot: { variables: { current: [...current] } }
    });

    trace({
      category: 'RECURSION',
      action: 'RETURN',
      payload: { message: \`Return from index \${index}\` },
      snapshot: {}
    });
  }

  backtrack(0, []);

  trace({
    category: 'RECURSION',
    action: 'COMPLETE',
    payload: { count: result.length, message: \`Generated \${result.length} subsets\` },
    snapshot: { variables: { result } }
  });

  return result;
}

generateSubsets([1, 2, 3]);
`;

export const PERMUTATIONS = `
function generatePermutations(arr) {
  const result = [];

  trace({
    category: 'RECURSION',
    action: 'INIT',
    payload: { array: arr, message: \`Generate all permutations of [\${arr}]\` },
    snapshot: { array: [...arr] }
  });

  function backtrack(current, remaining) {
    trace({
      category: 'RECURSION',
      action: 'CALL',
      payload: {
        function: 'backtrack',
        args: { current: [...current], remaining: [...remaining] },
        message: \`backtrack([\${current}], [\${remaining}])\`
      },
      snapshot: { variables: { current: [...current], remaining: [...remaining] } }
    });

    if (remaining.length === 0) {
      trace({
        category: 'RECURSION',
        action: 'OUTPUT',
        payload: { permutation: [...current], message: \`Output: [\${current}]\` },
        snapshot: { variables: { current: [...current] } }
      });
      result.push([...current]);

      trace({
        category: 'RECURSION',
        action: 'RETURN',
        payload: { message: 'Base case: no remaining elements' },
        snapshot: {}
      });
      return;
    }

    for (let i = 0; i < remaining.length; i++) {
      trace({
        category: 'RECURSION',
        action: 'CHOICE',
        payload: { choice: remaining[i], index: i, message: \`Choose \${remaining[i]} at position \${current.length}\` },
        snapshot: { variables: { i, chosen: remaining[i] } }
      });

      current.push(remaining[i]);
      const newRemaining = [...remaining.slice(0, i), ...remaining.slice(i + 1)];

      backtrack(current, newRemaining);

      const removed = current.pop();
      trace({
        category: 'RECURSION',
        action: 'BACKTRACK',
        payload: { removed, message: \`Backtrack: remove \${removed}\` },
        snapshot: { variables: { current: [...current] } }
      });
    }

    trace({
      category: 'RECURSION',
      action: 'RETURN',
      payload: { message: 'All choices explored, return' },
      snapshot: {}
    });
  }

  backtrack([], [...arr]);

  trace({
    category: 'RECURSION',
    action: 'COMPLETE',
    payload: { count: result.length, message: \`Generated \${result.length} permutations\` },
    snapshot: { variables: { result } }
  });

  return result;
}

generatePermutations([1, 2, 3]);
`;

export const N_QUEENS = `
function solveNQueens(n) {
  const board = Array(n).fill(-1); // board[row] = col where queen is placed
  const solutions = [];

  trace({
    category: 'RECURSION',
    action: 'INIT',
    payload: { n, message: \`Solve \${n}-Queens Problem\` },
    snapshot: { variables: { n, board: [...board] } }
  });

  function isSafe(row, col) {
    for (let prevRow = 0; prevRow < row; prevRow++) {
      const prevCol = board[prevRow];
      // Check same column or diagonals
      if (prevCol === col || Math.abs(prevCol - col) === Math.abs(prevRow - row)) {
        return false;
      }
    }
    return true;
  }

  function backtrack(row) {
    trace({
      category: 'RECURSION',
      action: 'CALL',
      payload: { function: 'backtrack', args: { row }, message: \`Try placing queen in row \${row}\` },
      snapshot: { variables: { row, board: [...board] } }
    });

    if (row === n) {
      trace({
        category: 'RECURSION',
        action: 'OUTPUT',
        payload: { solution: [...board], message: \`Solution found: [\${board}]\` },
        snapshot: { variables: { board: [...board] } }
      });
      solutions.push([...board]);

      trace({
        category: 'RECURSION',
        action: 'RETURN',
        payload: { message: 'All queens placed!' },
        snapshot: {}
      });
      return;
    }

    for (let col = 0; col < n; col++) {
      trace({
        category: 'RECURSION',
        action: 'TRY',
        payload: { row, col, message: \`Try queen at (\${row}, \${col})\` },
        snapshot: { variables: { row, col, board: [...board] } }
      });

      if (isSafe(row, col)) {
        trace({
          category: 'RECURSION',
          action: 'PLACE',
          payload: { row, col, message: \`Place queen at (\${row}, \${col}) - Valid!\` },
          snapshot: { variables: { row, col } }
        });

        board[row] = col;
        backtrack(row + 1);

        trace({
          category: 'RECURSION',
          action: 'BACKTRACK',
          payload: { row, col, message: \`Remove queen from (\${row}, \${col})\` },
          snapshot: { variables: { row, board: [...board] } }
        });

        board[row] = -1;
      } else {
        trace({
          category: 'RECURSION',
          action: 'CONFLICT',
          payload: { row, col, message: \`(\${row}, \${col}) conflicts with existing queen\` },
          snapshot: { variables: { row, col } }
        });
      }
    }

    trace({
      category: 'RECURSION',
      action: 'RETURN',
      payload: { message: \`No more columns to try in row \${row}\` },
      snapshot: {}
    });
  }

  backtrack(0);

  trace({
    category: 'RECURSION',
    action: 'COMPLETE',
    payload: { count: solutions.length, message: \`Found \${solutions.length} solution(s)\` },
    snapshot: { variables: { solutions } }
  });

  return solutions;
}

solveNQueens(4);
`;

// =============================================================================
// STACK & QUEUE ALGORITHMS
// =============================================================================

export const STACK_OPERATIONS = `
class Stack {
  constructor() {
    this.items = [];
    trace({
      category: 'STACK',
      action: 'INIT',
      payload: { message: 'Stack initialized' },
      snapshot: { stack: [] }
    });
  }

  push(item) {
    trace({
      category: 'STACK',
      action: 'PUSH',
      payload: { value: item, message: \`Push \${item}\` },
      snapshot: { stack: [...this.items] }
    });

    this.items.push(item);

    trace({
      category: 'STACK',
      action: 'AFTER_PUSH',
      payload: { value: item, size: this.items.length, message: \`Stack after push: [\${this.items}]\` },
      snapshot: { stack: [...this.items] }
    });
  }

  pop() {
    if (this.isEmpty()) {
      trace({
        category: 'STACK',
        action: 'ERROR',
        payload: { message: 'Cannot pop from empty stack' },
        snapshot: { stack: [] }
      });
      return undefined;
    }

    trace({
      category: 'STACK',
      action: 'POP',
      payload: { message: 'Pop top element' },
      snapshot: { stack: [...this.items] }
    });

    const item = this.items.pop();

    trace({
      category: 'STACK',
      action: 'AFTER_POP',
      payload: { value: item, message: \`Popped \${item}, Stack: [\${this.items}]\` },
      snapshot: { stack: [...this.items], variables: { popped: item } }
    });

    return item;
  }

  peek() {
    const top = this.items[this.items.length - 1];
    trace({
      category: 'STACK',
      action: 'PEEK',
      payload: { value: top, message: \`Top element: \${top}\` },
      snapshot: { stack: [...this.items] }
    });
    return top;
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

const stack = new Stack();
stack.push(10);
stack.push(20);
stack.push(30);
stack.peek();
stack.pop();
stack.pop();
stack.push(40);
stack.pop();
stack.pop();

trace({
  category: 'STACK',
  action: 'COMPLETE',
  payload: { message: 'Stack operations complete' },
  snapshot: { stack: [] }
});
`;

export const QUEUE_OPERATIONS = `
class Queue {
  constructor() {
    this.items = [];
    trace({
      category: 'QUEUE',
      action: 'INIT',
      payload: { message: 'Queue initialized' },
      snapshot: { queue: [] }
    });
  }

  enqueue(item) {
    trace({
      category: 'QUEUE',
      action: 'ENQUEUE',
      payload: { value: item, message: \`Enqueue \${item} at rear\` },
      snapshot: { queue: [...this.items] }
    });

    this.items.push(item);

    trace({
      category: 'QUEUE',
      action: 'AFTER_ENQUEUE',
      payload: { value: item, size: this.items.length, message: \`Queue after enqueue: [\${this.items}]\` },
      snapshot: { queue: [...this.items] }
    });
  }

  dequeue() {
    if (this.isEmpty()) {
      trace({
        category: 'QUEUE',
        action: 'ERROR',
        payload: { message: 'Cannot dequeue from empty queue' },
        snapshot: { queue: [] }
      });
      return undefined;
    }

    trace({
      category: 'QUEUE',
      action: 'DEQUEUE',
      payload: { message: 'Dequeue front element' },
      snapshot: { queue: [...this.items] }
    });

    const item = this.items.shift();

    trace({
      category: 'QUEUE',
      action: 'AFTER_DEQUEUE',
      payload: { value: item, message: \`Dequeued \${item}, Queue: [\${this.items}]\` },
      snapshot: { queue: [...this.items], variables: { dequeued: item } }
    });

    return item;
  }

  front() {
    const frontItem = this.items[0];
    trace({
      category: 'QUEUE',
      action: 'FRONT',
      payload: { value: frontItem, message: \`Front element: \${frontItem}\` },
      snapshot: { queue: [...this.items] }
    });
    return frontItem;
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

const queue = new Queue();
queue.enqueue(10);
queue.enqueue(20);
queue.enqueue(30);
queue.front();
queue.dequeue();
queue.dequeue();
queue.enqueue(40);
queue.dequeue();
queue.dequeue();

trace({
  category: 'QUEUE',
  action: 'COMPLETE',
  payload: { message: 'Queue operations complete' },
  snapshot: { queue: [] }
});
`;

// =============================================================================
// EXPORT ALL ALGORITHMS
// =============================================================================

export const DSA_ALGORITHMS = {
  // Sorting
  BUBBLE_SORT,
  SELECTION_SORT,
  INSERTION_SORT,
  QUICK_SORT,
  MERGE_SORT,

  // Searching
  LINEAR_SEARCH,
  BINARY_SEARCH,
  BINARY_SEARCH_RECURSIVE,

  // Recursion
  FACTORIAL,
  FIBONACCI,
  POWER,
  SUM_ARRAY,

  // Trees
  TREE_DFS,

  // Graphs
  GRAPH_DFS,
  GRAPH_BFS,

  // Backtracking
  SUBSETS,
  PERMUTATIONS,
  N_QUEENS,

  // Stack & Queue
  STACK_OPERATIONS,
  QUEUE_OPERATIONS,
} as const;

export type AlgorithmName = keyof typeof DSA_ALGORITHMS;
