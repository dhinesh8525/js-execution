// Web Worker script for sandboxed code execution
// This file runs in an isolated context

/* eslint-disable no-restricted-globals */

interface WorkerMessage {
  type: 'execute'
  code: string
}

interface WorkerGlobalScope {
  onmessage: ((event: MessageEvent<WorkerMessage>) => void) | null
  postMessage: (message: unknown) => void
  fetch?: unknown
  XMLHttpRequest?: unknown
  WebSocket?: unknown
  importScripts?: unknown
}

const workerSelf = self as unknown as WorkerGlobalScope

workerSelf.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, code } = event.data

  if (type === 'execute') {
    try {
      // Create a sandboxed function from the instrumented code
      const sandboxedFunction = new Function(code)
      sandboxedFunction()
    } catch (error) {
      workerSelf.postMessage({
        type: 'error',
        error: {
          message: error instanceof Error ? error.message : 'Execution error',
          stack: error instanceof Error ? error.stack : undefined,
        },
      })
    }
  }
}

// Disable dangerous globals for security
workerSelf.fetch = undefined
workerSelf.XMLHttpRequest = undefined
workerSelf.WebSocket = undefined
workerSelf.importScripts = undefined
