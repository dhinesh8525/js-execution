# Validation Examples

This document contains sample examples to validate both visualization modes work correctly.

## How to Test

1. Open the application at `http://localhost:3000`
2. Select an example from the dropdown
3. Click "Run Code"
4. Use the playback controls to step through
5. Verify the visualization matches expected behavior

---

## JS Runtime Mode Examples (Event Loop)

### 1. Event Loop Demo

**Example:** `Event Loop Demo`

**Code:**
```javascript
console.log('1. Start');

setTimeout(() => {
  console.log('4. Timeout callback');
}, 0);

Promise.resolve().then(() => {
  console.log('3. Promise callback');
});

console.log('2. End');
```

**Expected Visualization:**

| Step | Description | Call Stack | Microtask Queue | Macrotask Queue | Console |
|------|-------------|------------|-----------------|-----------------|---------|
| 1 | Execute console.log('1. Start') | Global | - | - | 1. Start |
| 2 | Execute setTimeout() | Global | - | - | 1. Start |
| 3 | Timer registered in Web APIs | Global | - | - | 1. Start |
| 4 | Execute Promise.resolve().then() | Global | .then callback | - | 1. Start |
| 5 | Execute console.log('2. End') | Global | .then callback | - | 1. Start, 2. End |
| 6 | Timer completes → macrotask queue | - | .then callback | setTimeout callback | 1. Start, 2. End |
| 7 | Drain microtask: Promise callback | .then callback | - | setTimeout callback | 1. Start, 2. End, 3. Promise |
| 8 | Run macrotask: Timeout callback | setTimeout cb | - | - | 1, 2, 3, 4. Timeout |

**What to Verify:**
- [x] Console output order: 1, 2, 3, 4
- [x] Microtask runs before macrotask
- [x] Call stack shows frame names
- [x] Web APIs shows timer countdown
- [x] Arrows animate between components

---

### 2. Promise Chain

**Example:** `Promise Chain`

**Code:**
```javascript
console.log('Start');

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
```

**Expected Behavior:**
- "Start" logs first
- "End" logs second
- Promise chain executes: Then 1: 1, Then 2: 2, Then 3: 3
- Each .then() is a separate microtask

**What to Verify:**
- [x] Values pass through chain correctly (1 → 2 → 3)
- [x] Microtask queue shows pending .then() callbacks
- [x] Each microtask executes in order

---

### 3. Multiple Timers

**Example:** `Multiple Timers`

**Code:**
```javascript
console.log('Start');

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
```

**Expected Behavior:**
1. Start, End (sync)
2. Promise (microtask - runs before any timer)
3. Timer 1, Timer 2 (0ms timers in order)
4. Timer 3 (100ms timer last)

**What to Verify:**
- [x] Web APIs shows 3 timers with different delays
- [x] Macrotask queue fills as timers complete
- [x] Microtask runs before any macrotask

---

### 4. Nested Promises

**Example:** `Nested Promises`

**Code:**
```javascript
console.log('Start');

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
```

**Expected Output:** Start → End → Promise 1 → Promise 2 → Nested Promise

**Why:** The nested promise is scheduled AFTER Promise 1 runs, but it still runs before any macrotask because microtask queue fully drains.

---

## DSA Mode Examples (Algorithm Visualization)

### 1. Array Operations

**Example:** `Array Operations`

**Code:**
```javascript
const arr = [5, 2, 8, 1, 9];

console.log("Original:", arr);

[arr[0], arr[4]] = [arr[4], arr[0]];
console.log("After swap 0,4:", arr);

[arr[1], arr[3]] = [arr[3], arr[1]];
console.log("After swap 1,3:", arr);

[arr[2], arr[3]] = [arr[3], arr[2]];
console.log("After swap 2,3:", arr);

console.log("Final:", arr);
```

**Expected Visualization:**

| Step | Array State | Swapping Indices | Console |
|------|-------------|------------------|---------|
| Init | [5, 2, 8, 1, 9] | - | Original: 5,2,8,1,9 |
| Swap 1 | [9, 2, 8, 1, 5] | 0, 4 (red) | After swap 0,4 |
| Swap 2 | [9, 1, 8, 2, 5] | 1, 3 (red) | After swap 1,3 |
| Swap 3 | [9, 1, 2, 8, 5] | 2, 3 (red) | After swap 2,3 |

**What to Verify:**
- [x] Array visualizer shows bars
- [x] Swapping indices highlight red
- [x] Values update after swap
- [x] Metrics show swap count

---

### 2. Bubble Sort (Simple)

**Example:** `Bubble Sort (Simple)`

**Code:**
```javascript
const arr = [64, 34, 25, 12, 22];
console.log("Initial array:", arr);

// First pass comparisons and swaps
j = 0;
if (arr[j] > arr[j + 1]) {
  [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
}
// ... continues
```

**Expected Visualization:**

| Step | Action | Array State | Swaps |
|------|--------|-------------|-------|
| Init | Initialize array | [64, 34, 25, 12, 22] | 0 |
| Compare | arr[0] > arr[1]? | [64, 34, ...] comparing | 0 |
| Swap | 64 ↔ 34 | [34, 64, 25, 12, 22] | 1 |
| Compare | arr[1] > arr[2]? | [..., 64, 25, ...] | 1 |
| Swap | 64 ↔ 25 | [34, 25, 64, 12, 22] | 2 |

**What to Verify:**
- [x] Yellow highlight for comparisons
- [x] Red highlight for swaps
- [x] Swap counter increments
- [x] Comparison counter increments (if tracked)

---

### 3. Reverse Array

**Example:** `Reverse Array`

**Code:**
```javascript
const arr = [1, 2, 3, 4, 5];

console.log("Original:", arr);

[arr[0], arr[4]] = [arr[4], arr[0]];
console.log("Swap 0,4:", arr);

[arr[1], arr[3]] = [arr[3], arr[1]];
console.log("Swap 1,3:", arr);

console.log("Reversed:", arr);
```

**Expected Result:** [1,2,3,4,5] → [5,2,3,4,1] → [5,4,3,2,1]

**What to Verify:**
- [x] Two swaps shown
- [x] Middle element (3) unchanged
- [x] Final array is reversed

---

### 4. Linear Search

**Example:** `Linear Search`

**Code:**
```javascript
const arr = [10, 25, 33, 47, 58, 69];
let target = 47;
let found = -1;

console.log("Searching for:", target);

let i = 0;
console.log("Check index 0:", arr[0]);

i = 1;
console.log("Check index 1:", arr[1]);
// ... continues until found
```

**Expected Visualization:**

| Step | Current Index | Element | Status |
|------|---------------|---------|--------|
| 1 | 0 | 10 | Not found |
| 2 | 1 | 25 | Not found |
| 3 | 2 | 33 | Not found |
| 4 | 3 | 47 | FOUND! |

**What to Verify:**
- [x] Variables panel shows `i`, `target`, `found`
- [x] Current access highlighted (blue)
- [x] Variable updates show change indicator

---

### 5. Two Pointers

**Example:** `Two Pointers`

**Code:**
```javascript
const arr = [1, 2, 3, 4, 5, 6];
let target = 7;

let left = 0;
let right = 5;

// Find pairs that sum to target
```

**Expected Visualization:**
- Variables: `left`, `right`, `target`, `sum`
- Pointer indicators on array bars
- Multiple pairs found: (1,6), (2,5), (3,4)

---

## Quick Validation Checklist

### JS Runtime Mode
- [ ] Call stack shows function frames
- [ ] Web APIs shows active timers
- [ ] Microtask queue shows promise callbacks
- [ ] Macrotask queue shows timer callbacks
- [ ] Event loop diagram shows current phase
- [ ] Connection arrows animate between panels
- [ ] Console output appears in order
- [ ] Step explanations are accurate

### DSA Mode
- [ ] Array visualizer shows bar chart
- [ ] Bars heights proportional to values
- [ ] Comparing indices highlight yellow
- [ ] Swapping indices highlight red
- [ ] Sorted indices highlight green
- [ ] Variables panel shows current values
- [ ] Changed variables show "CHANGED" badge
- [ ] Metrics panel shows comparisons/swaps
- [ ] Console output works

### Both Modes
- [ ] Mode selector shows correct mode
- [ ] Mode badge in dropdown shows DSA/Event Loop
- [ ] Step forward/backward works
- [ ] Play/Pause works
- [ ] Speed control works
- [ ] Reset returns to start
- [ ] Code highlighting matches execution

---

## Troubleshooting

### DSA Mode Not Detecting

If DSA mode isn't auto-detected:
1. Check if code has array operations
2. Use the mode toggle to manually select DSA
3. Ensure array is declared as `const arr = [...]`

### Swaps Not Visualizing

The DSA engine requires this exact swap pattern:
```javascript
[arr[i], arr[j]] = [arr[j], arr[i]];
```

Not this:
```javascript
const temp = arr[i];
arr[i] = arr[j];
arr[j] = temp;
```

### Console Output Not Showing

Ensure `console.log()` is used (not `console.error`, etc.)

---

## Adding New Examples

To add a new example:

1. Edit `lib/constants.ts`
2. Add to `EXAMPLE_SNIPPETS`:

```typescript
myExample: {
  title: 'My Example',
  category: 'dsa',  // or 'async', 'basics', 'scope'
  mode: 'DSA' as const,  // or 'JS_RUNTIME'
  complexity: { time: 'O(n)', space: 'O(1)' },
  description: 'Description here',
  code: `// Your code here`,
},
```

3. The example will appear in the dropdown under the specified category
