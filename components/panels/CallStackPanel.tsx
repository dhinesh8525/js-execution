'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'
import { useMemo } from 'react'

export function CallStackPanel() {
  const callStack = useExecutionStore((s) => s.callStack)
  const stepDiff = useExecutionStore((s) => s.stepDiff)

  // Track which items were just added
  const justAddedIds = useMemo(() => {
    if (!stepDiff) return new Set<string>()
    return new Set(stepDiff.addedToCallStack.map((f) => f.id))
  }, [stepDiff])

  return (
    <div id="callstack-panel" className="panel h-full flex flex-col">
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>CALL STACK</span>
        </div>
        <span className="text-xs font-normal normal-case text-[#666]">
          {callStack.length} {callStack.length === 1 ? 'FRAME' : 'FRAMES'}
        </span>
      </div>

      <div className="panel-content flex-1 overflow-auto">
        <AnimatePresence mode="popLayout">
          {callStack.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="text-2xl text-[#333] mb-1">∅</div>
              <span className="text-xs text-[#666]">Stack is empty</span>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {[...callStack].reverse().map((frame, index) => {
                const isTop = index === 0
                const isJustAdded = justAddedIds.has(frame.id)
                const isMicrotask = frame.type === 'microtask'
                const isMacrotask = frame.type === 'macrotask'

                return (
                  <motion.div
                    key={frame.id}
                    data-connection-id={frame.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      // Highlight just-added items
                      boxShadow: isJustAdded
                        ? [
                            '0 0 0 2px rgba(6, 182, 212, 0.5)',
                            '0 0 20px 4px rgba(6, 182, 212, 0.3)',
                            '0 0 0 2px rgba(6, 182, 212, 0)',
                          ]
                        : 'none',
                    }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                      delay: index * 0.05,
                      boxShadow: { duration: 0.6, times: [0, 0.3, 1] },
                    }}
                    className={`
                      rounded-lg border-2 p-3 transition-all relative
                      ${
                        isTop
                          ? isMicrotask
                            ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20'
                            : isMacrotask
                              ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20'
                              : 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20'
                          : 'bg-[#1a1a1a] border-[#333]'
                      }
                    `}
                  >
                    {/* New badge for just-added items */}
                    {isJustAdded && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-cyan-500 text-[10px] font-bold text-black rounded"
                      >
                        NEW
                      </motion.div>
                    )}

                    <div className="flex items-center gap-2">
                      <motion.div
                        className={`w-2 h-2 rounded-full ${
                          isTop
                            ? isMicrotask
                              ? 'bg-purple-400'
                              : isMacrotask
                                ? 'bg-green-400'
                                : 'bg-blue-400'
                            : 'bg-[#666]'
                        }`}
                        animate={isTop ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span
                        className={`font-medium ${
                          isTop
                            ? isMicrotask
                              ? 'text-purple-400'
                              : isMacrotask
                                ? 'text-green-400'
                                : 'text-blue-400'
                            : 'text-white'
                        }`}
                      >
                        {frame.name}
                      </span>
                      {isMicrotask && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded">
                          microtask
                        </span>
                      )}
                      {isMacrotask && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded">
                          macrotask
                        </span>
                      )}
                    </div>
                    {frame.line > 0 && <div className="text-xs text-[#666] mt-1">Line {frame.line}</div>}
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
