/**
 * ModeDetector - Analyzes JavaScript code to determine visualization mode
 *
 * Detects whether code is:
 * - JS_RUNTIME: Uses async patterns (setTimeout, Promise, async/await)
 * - DSA: Uses algorithm patterns (sorting, searching, recursion)
 *
 * Also detects specific algorithm types for DSA mode visualization.
 */

import type { ExecutionMode, AlgorithmType } from '../simulator/types'

export interface ModeDetectionResult {
  mode: ExecutionMode
  confidence: number // 0-1 score
  algorithmType: AlgorithmType | null
  indicators: {
    jsRuntime: string[]
    dsa: string[]
  }
}

// Pattern weights for detection
const JS_RUNTIME_PATTERNS = {
  // High confidence indicators
  setTimeout: { weight: 10, pattern: /setTimeout\s*\(/ },
  setInterval: { weight: 10, pattern: /setInterval\s*\(/ },
  Promise: { weight: 10, pattern: /Promise\s*\./ },
  promiseNew: { weight: 10, pattern: /new\s+Promise\s*\(/ },
  asyncAwait: { weight: 10, pattern: /async\s+function|await\s+/ },
  fetch: { weight: 10, pattern: /fetch\s*\(/ },
  thenCatch: { weight: 8, pattern: /\.then\s*\(|\.catch\s*\(|\.finally\s*\(/ },
  queueMicrotask: { weight: 10, pattern: /queueMicrotask\s*\(/ },
  // Medium confidence
  eventListener: { weight: 6, pattern: /addEventListener\s*\(/ },
  requestAnimationFrame: { weight: 8, pattern: /requestAnimationFrame\s*\(/ },
  callback: { weight: 3, pattern: /callback|cb\s*\(/ },
}

const DSA_PATTERNS = {
  // Array manipulation (sorting/searching)
  // Match any destructuring swap pattern: [arr[x], arr[y]] = [arr[y], arr[x]]
  arraySwap: { weight: 10, pattern: /\[arr\[.+?\],\s*arr\[.+?\]\]\s*=\s*\[arr\[.+?\],\s*arr\[.+?\]\]/ },
  // Also match swap with const arr declaration
  arrayDeclare: { weight: 6, pattern: /const\s+arr\s*=\s*\[[\d,\s]+\]/ },
  swapTemp: { weight: 6, pattern: /temp\s*=\s*arr\[|const\s+temp\s*=|let\s+temp\s*=/ },
  nestedLoop: { weight: 5, pattern: /for\s*\([^)]+\)\s*\{[^}]*for\s*\([^)]+\)/ },
  compareElements: { weight: 5, pattern: /arr\[.+?\]\s*[<>=]+\s*arr\[.+?\]/ },
  // Index variables commonly used in DSA
  indexVars: { weight: 4, pattern: /let\s+(i|j|left|right|minIdx|maxIdx)\s*=\s*\d/ },

  // Binary search indicators
  leftRight: { weight: 6, pattern: /let\s+(left|right)\s*=|left\s*<=\s*right|left\s*<\s*right/ },
  midCalc: { weight: 8, pattern: /Math\.floor\s*\(\s*\(\s*left\s*\+\s*right\s*\)\s*\/\s*2\s*\)/ },

  // Recursion
  recursiveCall: { weight: 7, pattern: /function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*\1\s*\(/ },
  baseCase: { weight: 5, pattern: /if\s*\(\s*n\s*[<=>]+\s*[01]\s*\)|if\s*\(\s*\w+\.length\s*[<=>]+\s*[01]\s*\)/ },

  // Tree patterns
  treeNode: { weight: 8, pattern: /node\.left|node\.right|root\.left|root\.right/ },
  treeTraversal: { weight: 6, pattern: /inorder|preorder|postorder|levelOrder/ },

  // Graph patterns
  graphAdjacency: { weight: 8, pattern: /adjacency|graph\[|visited\.add|visited\[/ },
  bfsDfs: { weight: 7, pattern: /\bbfs\b|\bdfs\b|breadth.?first|depth.?first/i },

  // DP patterns
  dpTable: { weight: 8, pattern: /dp\s*\[.+\]\s*\[.+\]|dp\[i\]\[j\]|memo\[/ },
  dpInit: { weight: 5, pattern: /Array\(.+\)\.fill\(.+\)\.map/ },

  // Linked list patterns
  linkedList: { weight: 7, pattern: /\.next\s*=|current\.next|head\.next/ },
  listTraversal: { weight: 5, pattern: /while\s*\(\s*current\s*!==?\s*null\s*\)/ },

  // Generic algorithm indicators
  pivotPartition: { weight: 7, pattern: /pivot|partition/ },
  mergeFunction: { weight: 6, pattern: /function\s+merge\s*\(|const\s+merge\s*=/ },
  sliceSplice: { weight: 3, pattern: /\.slice\s*\(.*mid|\.splice\s*\(/ },
}

// Algorithm type detection patterns
const ALGORITHM_PATTERNS: Record<AlgorithmType, { pattern: RegExp; weight: number }[]> = {
  SORTING: [
    { pattern: /bubble.?sort|bubblesort/i, weight: 10 },
    { pattern: /merge.?sort|mergesort/i, weight: 10 },
    { pattern: /quick.?sort|quicksort/i, weight: 10 },
    { pattern: /insertion.?sort|insertionsort/i, weight: 10 },
    { pattern: /selection.?sort|selectionsort/i, weight: 10 },
    { pattern: /heap.?sort|heapsort/i, weight: 10 },
    { pattern: /\[\s*arr\[.+\]\s*,\s*arr\[.+\]\s*\]\s*=/, weight: 6 },
    { pattern: /for\s*\([^)]+\)\s*\{[^}]*for\s*\([^)]+\)[^}]*arr\[.+\]\s*[<>]/, weight: 5 },
  ],
  SEARCHING: [
    { pattern: /binary.?search|binarysearch/i, weight: 10 },
    { pattern: /linear.?search|linearsearch/i, weight: 10 },
    { pattern: /left\s*<=?\s*right[\s\S]*mid/, weight: 8 },
    { pattern: /Math\.floor\s*\(\s*\(\s*left\s*\+\s*right\s*\)/, weight: 7 },
  ],
  TREE_TRAVERSAL: [
    { pattern: /inorder|preorder|postorder|levelorder/i, weight: 10 },
    { pattern: /traverse.*(left|right)|node\.(left|right)/i, weight: 7 },
    { pattern: /binary.?tree|bst|binarysearchtree/i, weight: 8 },
  ],
  GRAPH_TRAVERSAL: [
    { pattern: /\bbfs\b|\bdfs\b/i, weight: 10 },
    { pattern: /breadth.?first|depth.?first/i, weight: 10 },
    { pattern: /dijkstra|bellman|floyd/i, weight: 10 },
    { pattern: /adjacency|graph\[.*\].*neighbors/i, weight: 7 },
  ],
  RECURSION: [
    { pattern: /fibonacci|fib\s*\(/i, weight: 10 },
    { pattern: /factorial/i, weight: 10 },
    { pattern: /hanoi/i, weight: 10 },
    { pattern: /function\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*?\1\s*\(/, weight: 6 },
  ],
  DYNAMIC_PROGRAMMING: [
    { pattern: /dp\s*\[|memo\[|memoization/i, weight: 8 },
    { pattern: /knapsack|lcs|longest.?common/i, weight: 10 },
    { pattern: /coin.?change|edit.?distance/i, weight: 10 },
  ],
  LINKED_LIST: [
    { pattern: /linked.?list/i, weight: 10 },
    { pattern: /\.next\s*=|current\.next/i, weight: 7 },
    { pattern: /reverse.*list|list.*reverse/i, weight: 8 },
  ],
  STACK_QUEUE: [
    { pattern: /stack\.push|stack\.pop|queue\.enqueue|queue\.dequeue/i, weight: 8 },
    { pattern: /class\s+Stack|class\s+Queue/i, weight: 10 },
  ],
  GENERIC: [],
}

export class ModeDetector {
  /**
   * Analyze code and determine the execution mode
   */
  static detect(code: string): ModeDetectionResult {
    const jsRuntimeScore = this.calculateJSRuntimeScore(code)
    const dsaScore = this.calculateDSAScore(code)
    const indicators = this.getIndicators(code)

    // Normalize scores
    const totalScore = jsRuntimeScore.score + dsaScore.score
    const jsRuntimeConfidence = totalScore > 0 ? jsRuntimeScore.score / totalScore : 0.5
    const dsaConfidence = totalScore > 0 ? dsaScore.score / totalScore : 0.5

    // Determine mode based on higher score
    // Use a threshold to avoid false positives
    let mode: ExecutionMode
    let confidence: number

    if (jsRuntimeScore.score > dsaScore.score && jsRuntimeScore.score >= 5) {
      mode = 'JS_RUNTIME'
      confidence = jsRuntimeConfidence
    } else if (dsaScore.score > jsRuntimeScore.score && dsaScore.score >= 5) {
      mode = 'DSA'
      confidence = dsaConfidence
    } else {
      // Default to JS_RUNTIME for ambiguous cases (backwards compatibility)
      mode = 'JS_RUNTIME'
      confidence = 0.5
    }

    // Detect algorithm type if in DSA mode
    const algorithmType = mode === 'DSA' ? this.detectAlgorithmType(code) : null

    return {
      mode,
      confidence: Math.min(1, Math.max(0, confidence)),
      algorithmType,
      indicators,
    }
  }

  /**
   * Calculate JS Runtime pattern score
   */
  private static calculateJSRuntimeScore(code: string): { score: number; matches: string[] } {
    let score = 0
    const matches: string[] = []

    for (const [name, { weight, pattern }] of Object.entries(JS_RUNTIME_PATTERNS)) {
      if (pattern.test(code)) {
        score += weight
        matches.push(name)
      }
    }

    return { score, matches }
  }

  /**
   * Calculate DSA pattern score
   */
  private static calculateDSAScore(code: string): { score: number; matches: string[] } {
    let score = 0
    const matches: string[] = []

    for (const [name, { weight, pattern }] of Object.entries(DSA_PATTERNS)) {
      if (pattern.test(code)) {
        score += weight
        matches.push(name)
      }
    }

    return { score, matches }
  }

  /**
   * Get human-readable indicators for both modes
   */
  private static getIndicators(code: string): { jsRuntime: string[]; dsa: string[] } {
    const jsRuntime: string[] = []
    const dsa: string[] = []

    // Check JS Runtime patterns
    if (/setTimeout\s*\(/.test(code)) jsRuntime.push('setTimeout')
    if (/setInterval\s*\(/.test(code)) jsRuntime.push('setInterval')
    if (/Promise/.test(code)) jsRuntime.push('Promise')
    if (/async\s+function|await\s+/.test(code)) jsRuntime.push('async/await')
    if (/\.then\s*\(/.test(code)) jsRuntime.push('.then()')
    if (/fetch\s*\(/.test(code)) jsRuntime.push('fetch')

    // Check DSA patterns
    if (/\[arr\[.+?\],\s*arr\[.+?\]\]\s*=/.test(code)) dsa.push('Array swap')
    if (/const\s+arr\s*=\s*\[[\d,\s]+\]/.test(code)) dsa.push('Array declaration')
    if (/for\s*\([^)]+\)\s*\{[\s\S]*?for\s*\([^)]+\)/.test(code)) dsa.push('Nested loops')
    if (/left\s*<=?\s*right/.test(code)) dsa.push('Binary search pattern')
    if (/node\.left|node\.right/.test(code)) dsa.push('Tree traversal')
    if (/\.next\s*=/.test(code)) dsa.push('Linked list')
    if (/dp\s*\[.*\]\s*\[.*\]/.test(code)) dsa.push('DP table')
    if (/function\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*?\1\s*\(/.test(code)) dsa.push('Recursion')

    return { jsRuntime, dsa }
  }

  /**
   * Detect specific algorithm type for DSA mode
   */
  private static detectAlgorithmType(code: string): AlgorithmType {
    let bestType: AlgorithmType = 'GENERIC'
    let bestScore = 0

    for (const [type, patterns] of Object.entries(ALGORITHM_PATTERNS)) {
      let score = 0
      for (const { pattern, weight } of patterns) {
        if (pattern.test(code)) {
          score += weight
        }
      }
      if (score > bestScore) {
        bestScore = score
        bestType = type as AlgorithmType
      }
    }

    return bestType
  }

  /**
   * Force a specific mode (for manual override)
   */
  static forceMode(mode: ExecutionMode, algorithmType?: AlgorithmType): ModeDetectionResult {
    return {
      mode,
      confidence: 1,
      algorithmType: mode === 'DSA' ? (algorithmType ?? 'GENERIC') : null,
      indicators: { jsRuntime: [], dsa: [] },
    }
  }
}

export default ModeDetector
