/**
 * Tests for EventLoopEngine
 *
 * These tests verify that the event loop simulation matches
 * actual browser behavior.
 */

import { EventLoopEngine } from '../EventLoopEngine'

describe('EventLoopEngine', () => {
  let engine: EventLoopEngine

  beforeEach(() => {
    engine = new EventLoopEngine({ includeExplanations: false })
  })

  describe('Synchronous Code', () => {
    it('executes console.log statements in order', () => {
      const code = `
        console.log('first')
        console.log('second')
        console.log('third')
      `
      const steps = engine.simulate(code)
      const outputs = steps
        .filter((s) => s.type === 'console-output')
        .map((s) => s.consoleOutput.slice(-1)[0]?.value)

      expect(outputs).toEqual(['first', 'second', 'third'])
    })
  })

  describe('Microtask Queue', () => {
    it('executes Promise.then() after sync code', () => {
      const code = `
        console.log('sync 1')
        Promise.resolve().then(() => console.log('microtask'))
        console.log('sync 2')
      `
      const steps = engine.simulate(code)
      const outputs = steps
        .filter((s) => s.type === 'console-output')
        .map((s) => s.consoleOutput.slice(-1)[0]?.value)

      // Expected: sync 1, sync 2, microtask
      expect(outputs).toEqual(['sync 1', 'sync 2', 'microtask'])
    })

    it('executes queueMicrotask() after sync code', () => {
      const code = `
        console.log('sync')
        queueMicrotask(() => console.log('microtask'))
        console.log('sync 2')
      `
      const steps = engine.simulate(code)
      const outputs = steps
        .filter((s) => s.type === 'console-output')
        .map((s) => s.consoleOutput.slice(-1)[0]?.value)

      expect(outputs).toEqual(['sync', 'sync 2', 'microtask'])
    })

    it('drains ALL microtasks before any macrotask', () => {
      const code = `
        console.log('sync')
        setTimeout(() => console.log('timeout'), 0)
        Promise.resolve().then(() => console.log('microtask 1'))
        Promise.resolve().then(() => console.log('microtask 2'))
      `
      const steps = engine.simulate(code)
      const outputs = steps
        .filter((s) => s.type === 'console-output')
        .map((s) => s.consoleOutput.slice(-1)[0]?.value)

      // Expected: sync, microtask 1, microtask 2, timeout
      expect(outputs).toEqual(['sync', 'microtask 1', 'microtask 2', 'timeout'])
    })
  })

  describe('Macrotask Queue', () => {
    it('executes setTimeout after microtasks', () => {
      const code = `
        console.log('sync')
        setTimeout(() => console.log('timeout'), 0)
        Promise.resolve().then(() => console.log('microtask'))
      `
      const steps = engine.simulate(code)
      const outputs = steps
        .filter((s) => s.type === 'console-output')
        .map((s) => s.consoleOutput.slice(-1)[0]?.value)

      // Expected: sync, microtask, timeout
      expect(outputs).toEqual(['sync', 'microtask', 'timeout'])
    })

    it('executes only ONE macrotask per event loop iteration', () => {
      const code = `
        setTimeout(() => console.log('timeout 1'), 0)
        setTimeout(() => console.log('timeout 2'), 0)
        Promise.resolve().then(() => console.log('microtask'))
      `
      const steps = engine.simulate(code)

      // Find the step where we check macrotasks
      const macrotaskChecks = steps.filter((s) => s.type === 'event-loop-check-macrotasks')

      // Should check macrotask queue twice (once for each macrotask)
      expect(macrotaskChecks.length).toBe(2)
    })
  })

  describe('Event Loop Order (Critical Tests)', () => {
    it('handles the classic event loop quiz', () => {
      // This is the famous event loop quiz question
      const code = `
        console.log('1')
        setTimeout(() => console.log('2'), 0)
        Promise.resolve().then(() => console.log('3'))
        console.log('4')
      `
      const steps = engine.simulate(code)
      const outputs = steps
        .filter((s) => s.type === 'console-output')
        .map((s) => s.consoleOutput.slice(-1)[0]?.value)

      // Expected browser output: 1, 4, 3, 2
      expect(outputs).toEqual(['1', '4', '3', '2'])
    })

    it('microtasks scheduled during microtask execution run before macrotasks', () => {
      // This tests that microtask queue drains COMPLETELY
      const code = `
        console.log('start')
        setTimeout(() => console.log('timeout'), 0)
        Promise.resolve().then(() => {
          console.log('microtask 1')
          Promise.resolve().then(() => console.log('nested microtask'))
        })
        console.log('end')
      `
      const steps = engine.simulate(code)
      const outputs = steps
        .filter((s) => s.type === 'console-output')
        .map((s) => s.consoleOutput.slice(-1)[0]?.value)

      // Expected: start, end, microtask 1, nested microtask, timeout
      // The nested microtask MUST run before the timeout
      expect(outputs).toEqual(['start', 'end', 'microtask 1', 'nested microtask', 'timeout'])
    })
  })

  describe('Timer Ordering', () => {
    it('executes timers in order of completion time', () => {
      const code = `
        setTimeout(() => console.log('100ms'), 100)
        setTimeout(() => console.log('0ms'), 0)
        setTimeout(() => console.log('50ms'), 50)
      `
      const steps = engine.simulate(code)
      const outputs = steps
        .filter((s) => s.type === 'console-output')
        .map((s) => s.consoleOutput.slice(-1)[0]?.value)

      // Expected: 0ms, 50ms, 100ms (ordered by delay)
      expect(outputs).toEqual(['0ms', '50ms', '100ms'])
    })
  })

  describe('Phase Transitions', () => {
    it('correctly transitions through phases', () => {
      const code = `
        console.log('sync')
        Promise.resolve().then(() => console.log('micro'))
        setTimeout(() => console.log('macro'), 0)
      `
      const steps = engine.simulate(code)

      // Check phase progression
      const phases = steps.map((s) => s.phase)

      // Should have sync → microtask → macrotask → idle transitions
      expect(phases).toContain('sync')
      expect(phases).toContain('microtask')
      expect(phases).toContain('macrotask')
      expect(phases[phases.length - 1]).toBe('idle')
    })
  })
})
