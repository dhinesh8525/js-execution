import type { ExecutionSnapshot, TraceEvent } from '@/types/execution'
import { StepManager } from './stepManager'

export interface TimeTravelState {
  currentStep: number
  totalSteps: number
  canGoBack: boolean
  canGoForward: boolean
  isPlaying: boolean
  playbackSpeed: number
}

export class TimeTravel {
  private stepManager: StepManager
  private playIntervalId: ReturnType<typeof setInterval> | null = null
  private playbackSpeed = 1 // steps per second
  private onStateChange: ((snapshot: ExecutionSnapshot | null, state: TimeTravelState) => void) | null = null

  constructor() {
    this.stepManager = new StepManager()
  }

  setEvents(events: TraceEvent[]) {
    this.stop()
    this.stepManager.setEvents(events)
    this.notifyStateChange()
  }

  setStateChangeHandler(handler: (snapshot: ExecutionSnapshot | null, state: TimeTravelState) => void) {
    this.onStateChange = handler
  }

  setPlaybackSpeed(speed: number) {
    this.playbackSpeed = Math.max(0.25, Math.min(4, speed))

    // If currently playing, restart with new speed
    if (this.playIntervalId) {
      this.stop()
      this.play()
    }
  }

  play() {
    if (this.playIntervalId) return

    const interval = 1000 / this.playbackSpeed
    this.playIntervalId = setInterval(() => {
      const snapshot = this.stepManager.nextStep()
      if (snapshot === null || this.stepManager.getCurrentStep() >= this.stepManager.getTotalSteps() - 1) {
        this.stop()
      }
      this.notifyStateChange()
    }, interval)

    this.notifyStateChange()
  }

  pause() {
    this.stop()
  }

  stop() {
    if (this.playIntervalId) {
      clearInterval(this.playIntervalId)
      this.playIntervalId = null
    }
    this.notifyStateChange()
  }

  stepForward(): ExecutionSnapshot | null {
    this.stop()
    const snapshot = this.stepManager.nextStep()
    this.notifyStateChange()
    return snapshot
  }

  stepBackward(): ExecutionSnapshot | null {
    this.stop()
    const snapshot = this.stepManager.prevStep()
    this.notifyStateChange()
    return snapshot
  }

  goToStep(step: number): ExecutionSnapshot | null {
    this.stop()
    const snapshot = this.stepManager.goToStep(step)
    this.notifyStateChange()
    return snapshot
  }

  reset() {
    this.stop()
    this.stepManager.goToStep(-1)
    this.notifyStateChange()
  }

  goToStart() {
    this.stop()
    this.stepManager.goToStep(0)
    this.notifyStateChange()
  }

  goToEnd() {
    this.stop()
    this.stepManager.goToStep(this.stepManager.getTotalSteps() - 1)
    this.notifyStateChange()
  }

  getCurrentSnapshot(): ExecutionSnapshot | null {
    return this.stepManager.getSnapshot(this.stepManager.getCurrentStep())
  }

  getCurrentEvent(): TraceEvent | null {
    return this.stepManager.getEvent(this.stepManager.getCurrentStep())
  }

  getState(): TimeTravelState {
    const currentStep = this.stepManager.getCurrentStep()
    const totalSteps = this.stepManager.getTotalSteps()

    return {
      currentStep,
      totalSteps,
      canGoBack: currentStep > -1,
      canGoForward: currentStep < totalSteps - 1,
      isPlaying: this.playIntervalId !== null,
      playbackSpeed: this.playbackSpeed,
    }
  }

  private notifyStateChange() {
    if (this.onStateChange) {
      const snapshot = this.getCurrentSnapshot()
      const state = this.getState()
      this.onStateChange(snapshot, state)
    }
  }

  destroy() {
    this.stop()
    this.onStateChange = null
  }
}
