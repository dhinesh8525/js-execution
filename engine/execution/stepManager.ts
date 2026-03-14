import type { TraceEvent, ExecutionSnapshot } from '@/types/execution'
import { TraceCollector } from '../runtime/traceCollector'

export class StepManager {
  private events: TraceEvent[] = []
  private snapshots: Map<number, ExecutionSnapshot> = new Map()
  private collector: TraceCollector
  private currentStep = -1

  constructor() {
    this.collector = new TraceCollector()
  }

  setEvents(events: TraceEvent[]) {
    this.events = events
    this.snapshots.clear()
    this.collector.reset()
    this.currentStep = -1

    // Pre-compute all snapshots
    events.forEach((event, index) => {
      const snapshot = this.collector.processEvent(event, index)
      this.snapshots.set(index, snapshot)
    })
  }

  getSnapshot(step: number): ExecutionSnapshot | null {
    if (step < 0 || step >= this.events.length) {
      return null
    }
    return this.snapshots.get(step) || null
  }

  getEvent(step: number): TraceEvent | null {
    if (step < 0 || step >= this.events.length) {
      return null
    }
    return this.events[step]
  }

  goToStep(step: number): ExecutionSnapshot | null {
    if (step < -1 || step >= this.events.length) {
      return null
    }

    this.currentStep = step

    if (step === -1) {
      return {
        stepIndex: -1,
        callStack: [],
        scopes: new Map(),
        heap: new Map(),
        currentLine: 0,
        console: [],
        eventLoop: {
          phase: 'call-stack',
          callbackQueue: [],
          microtaskQueue: [],
        },
      }
    }

    return this.snapshots.get(step) || null
  }

  nextStep(): ExecutionSnapshot | null {
    if (this.currentStep < this.events.length - 1) {
      return this.goToStep(this.currentStep + 1)
    }
    return null
  }

  prevStep(): ExecutionSnapshot | null {
    if (this.currentStep > -1) {
      return this.goToStep(this.currentStep - 1)
    }
    return null
  }

  getCurrentStep(): number {
    return this.currentStep
  }

  getTotalSteps(): number {
    return this.events.length
  }

  getEventsForLine(line: number): TraceEvent[] {
    return this.events.filter((e) => e.location.line === line)
  }

  // Find step that shows a specific variable declaration
  findVariableDeclaration(name: string): number {
    return this.events.findIndex(
      (e) => e.type === 'declare' && (e as any).name === name
    )
  }

  // Find all steps where a variable is modified
  findVariableModifications(name: string): number[] {
    return this.events
      .map((e, i) => (e.type === 'assign' && (e as any).name === name ? i : -1))
      .filter((i) => i !== -1)
  }
}
