import { instrumentCode } from '../instrumentation/instrumenter'
import { Sandbox } from '../runtime/sandbox'
import type { TraceEvent } from '@/types/execution'

export interface ExecutionEngineOptions {
  onTraceEvent?: (event: TraceEvent) => void
  onError?: (error: { message: string; line?: number }) => void
  timeout?: number
}

export class ExecutionEngine {
  private sandbox: Sandbox
  private options: ExecutionEngineOptions

  constructor(options: ExecutionEngineOptions = {}) {
    this.options = options
    this.sandbox = new Sandbox()

    if (options.onTraceEvent) {
      this.sandbox.setTraceHandler(options.onTraceEvent)
    }
  }

  async execute(code: string): Promise<{
    success: boolean
    events: TraceEvent[]
    error?: { message: string; line?: number }
  }> {
    // Instrument the code
    const instrumentResult = instrumentCode(code)

    if (!instrumentResult.success || !instrumentResult.instrumentedCode) {
      const error = {
        message: instrumentResult.errors?.[0]?.message || 'Instrumentation error',
        line: instrumentResult.errors?.[0]?.location?.line,
      }
      this.options.onError?.(error)
      return { success: false, events: [], error }
    }

    // Execute in sandbox
    try {
      const result = await this.sandbox.execute(
        instrumentResult.instrumentedCode,
        this.options.timeout || 10000
      )

      if (!result.success) {
        const error = {
          message: result.error?.message || 'Execution error',
          line: result.error?.location?.line,
        }
        this.options.onError?.(error)
        return { success: false, events: result.events, error }
      }

      return { success: true, events: result.events }
    } catch (err) {
      const error = {
        message: err instanceof Error ? err.message : 'Execution failed',
      }
      this.options.onError?.(error)
      return { success: false, events: [], error }
    }
  }

  terminate() {
    this.sandbox.terminate()
  }
}
