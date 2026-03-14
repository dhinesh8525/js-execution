import type { TraceEvent, ExecutionResult } from '@/types/execution'

export class Sandbox {
  private worker: Worker | null = null
  private events: TraceEvent[] = []
  private startTime: number = 0
  private timeout: ReturnType<typeof setTimeout> | null = null
  private onTraceEvent: ((event: TraceEvent) => void) | null = null

  setTraceHandler(handler: (event: TraceEvent) => void) {
    this.onTraceEvent = handler
  }

  async execute(instrumentedCode: string, timeoutMs = 10000): Promise<ExecutionResult> {
    this.events = []
    this.startTime = Date.now()

    return new Promise((resolve) => {
      // Create worker with inline code
      const workerCode = `
        self.onmessage = function(event) {
          if (event.data.type === 'execute') {
            try {
              var fn = new Function(event.data.code);
              fn();
            } catch (error) {
              self.postMessage({
                type: 'error',
                error: {
                  message: error.message || 'Execution error',
                  stack: error.stack,
                },
              });
            }
          }
        };
      `

      const blob = new Blob([workerCode], { type: 'application/javascript' })
      const workerUrl = URL.createObjectURL(blob)

      try {
        this.worker = new Worker(workerUrl)
      } catch (err) {
        URL.revokeObjectURL(workerUrl)
        resolve({
          success: false,
          events: [],
          console: [],
          error: { message: 'Failed to create worker' },
          duration: 0,
        })
        return
      }

      this.worker.onmessage = (event) => {
        const { type, ...data } = event.data

        switch (type) {
          case 'trace':
            if (this.events.length < 5000) {
              this.events.push(data.event)
              this.onTraceEvent?.(data.event)
            }
            break

          case 'complete':
            this.cleanup()
            URL.revokeObjectURL(workerUrl)
            resolve({
              success: true,
              events: this.events,
              console: [],
              duration: Date.now() - this.startTime,
            })
            break

          case 'error':
            this.cleanup()
            URL.revokeObjectURL(workerUrl)
            resolve({
              success: false,
              events: this.events,
              console: [],
              error: data.error,
              duration: Date.now() - this.startTime,
            })
            break
        }
      }

      this.worker.onerror = (error) => {
        this.cleanup()
        URL.revokeObjectURL(workerUrl)
        resolve({
          success: false,
          events: this.events,
          console: [],
          error: { message: error.message || 'Worker error' },
          duration: Date.now() - this.startTime,
        })
      }

      // Set timeout
      this.timeout = setTimeout(() => {
        this.cleanup()
        URL.revokeObjectURL(workerUrl)
        resolve({
          success: false,
          events: this.events,
          console: [],
          error: { message: 'Execution timeout' },
          duration: timeoutMs,
        })
      }, timeoutMs)

      // Send code to worker
      this.worker.postMessage({ type: 'execute', code: instrumentedCode })
    })
  }

  private cleanup() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  }

  terminate() {
    this.cleanup()
  }
}
