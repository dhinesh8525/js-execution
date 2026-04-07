/**
 * TimelineGenerator - Generates timeline events from execution steps
 *
 * Provides a high-level view of the event loop phases:
 * Sync → Microtasks → Macrotask → Microtasks → ...
 *
 * Note: Only works with JS Runtime steps. DSA steps don't have event loop phases.
 */

import type { ExecutionStep, TimelineEvent, TimelinePhaseType, EventLoopPhase, JSRuntimeStep } from './types'
import { isJSRuntimeStep } from './types'

/**
 * Generate timeline events from a sequence of execution steps
 */
export function generateTimeline(steps: ExecutionStep[]): TimelineEvent[] {
  if (steps.length === 0) return []

  const events: TimelineEvent[] = []
  let currentPhase: TimelinePhaseType | null = null
  let phaseStartStep = 0
  let taskCount = 0
  let idCounter = 0

  const mapPhaseToTimelinePhase = (phase: EventLoopPhase): TimelinePhaseType => {
    switch (phase) {
      case 'sync':
        return 'sync'
      case 'microtask':
        return 'microtask-drain'
      case 'macrotask':
        return 'macrotask-execute'
      default:
        return 'idle'
    }
  }

  const finishCurrentPhase = (endStep: number) => {
    if (currentPhase === null) return

    const duration = endStep - phaseStartStep + 1
    const label = getPhaseLabel(currentPhase, taskCount)
    const description = getPhaseDescription(currentPhase, taskCount)

    events.push({
      id: `timeline-${++idCounter}`,
      phase: currentPhase,
      label,
      startStep: phaseStartStep,
      endStep,
      duration,
      taskCount,
      description,
    })
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]

    // Skip non-JS Runtime steps (DSA mode)
    if (!isJSRuntimeStep(step)) continue

    const timelinePhase = mapPhaseToTimelinePhase(step.phase)

    // Check for phase transitions
    if (timelinePhase !== currentPhase) {
      // Finish the previous phase
      if (currentPhase !== null && i > 0) {
        finishCurrentPhase(i - 1)
      }

      // Start a new phase
      currentPhase = timelinePhase
      phaseStartStep = i
      taskCount = 0
    }

    // Count tasks executed in this phase
    if (
      step.type === 'event-loop-run-microtask' ||
      step.type === 'event-loop-run-macrotask' ||
      step.type === 'sync-execute'
    ) {
      taskCount++
    }
  }

  // Finish the last phase
  if (currentPhase !== null) {
    finishCurrentPhase(steps.length - 1)
  }

  return events
}

function getPhaseLabel(phase: TimelinePhaseType, taskCount: number): string {
  switch (phase) {
    case 'sync':
      return `Sync (${taskCount})`
    case 'microtask-drain':
      return `Microtasks (${taskCount})`
    case 'macrotask-execute':
      return `Macrotask`
    case 'idle':
      return 'Idle'
  }
}

function getPhaseDescription(phase: TimelinePhaseType, taskCount: number): string {
  switch (phase) {
    case 'sync':
      return `Executed ${taskCount} synchronous operation${taskCount !== 1 ? 's' : ''}`
    case 'microtask-drain':
      return `Drained ${taskCount} microtask${taskCount !== 1 ? 's' : ''} from the queue`
    case 'macrotask-execute':
      return 'Executed one macrotask from the queue'
    case 'idle':
      return 'Event loop idle - all queues empty'
  }
}

/**
 * Get color for a timeline phase
 */
export function getPhaseColor(phase: TimelinePhaseType): string {
  switch (phase) {
    case 'sync':
      return '#3b82f6' // blue
    case 'microtask-drain':
      return '#a855f7' // purple
    case 'macrotask-execute':
      return '#22c55e' // green
    case 'idle':
      return '#6b7280' // gray
  }
}

/**
 * Get background color for a timeline phase
 */
export function getPhaseBgColor(phase: TimelinePhaseType): string {
  switch (phase) {
    case 'sync':
      return 'rgba(59, 130, 246, 0.2)'
    case 'microtask-drain':
      return 'rgba(168, 85, 247, 0.2)'
    case 'macrotask-execute':
      return 'rgba(34, 197, 94, 0.2)'
    case 'idle':
      return 'rgba(107, 114, 128, 0.2)'
  }
}

export default generateTimeline
