'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'
import { useMemo } from 'react'

export function TaskQueuePanel() {
  const macrotaskQueue = useExecutionStore((s) => s.macrotaskQueue)
  const stepDiff = useExecutionStore((s) => s.stepDiff)
  const currentPhase = useExecutionStore((s) => s.currentPhase)

  // Track which items were just added
  const justAddedIds = useMemo(() => {
    if (!stepDiff) return new Set<string>()
    return new Set(stepDiff.addedMacrotasks.map((t) => t.id))
  }, [stepDiff])

  const isActive = currentPhase === 'macrotask'

  return (
    <div id="macrotask-panel" className={`panel h-full flex flex-col ${isActive ? 'ring-2 ring-green-500/50' : ''}`}>
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <motion.span
            className="text-green-400 text-lg"
            animate={isActive ? { rotate: [0, 360] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            ↻
          </motion.span>
          <div>
            <span>TASK QUEUE</span>
            <span className="text-[10px] text-[#666] ml-1">(MACROTASKS)</span>
          </div>
        </div>
        <span className="text-xs font-normal normal-case text-[#666]">{macrotaskQueue.length} TASKS</span>
      </div>

      <div className="panel-content flex-1 overflow-auto">
        <AnimatePresence mode="popLayout">
          {macrotaskQueue.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="text-2xl text-[#333] mb-1">∅</div>
              <span className="text-xs text-[#666]">Queue is empty</span>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {macrotaskQueue.map((task, index) => {
                const isJustAdded = justAddedIds.has(task.id)
                const isNext = index === 0

                return (
                  <motion.div
                    key={task.id}
                    data-connection-id={task.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      boxShadow: isJustAdded
                        ? [
                            '0 0 0 2px rgba(34, 197, 94, 0.5)',
                            '0 0 20px 4px rgba(34, 197, 94, 0.3)',
                            '0 0 0 2px rgba(34, 197, 94, 0)',
                          ]
                        : 'none',
                    }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                      delay: index * 0.05,
                      boxShadow: { duration: 0.6, times: [0, 0.3, 1] },
                    }}
                    className={`rounded-lg border-2 p-3 relative ${
                      isNext && isActive
                        ? 'border-green-400 bg-green-500/20'
                        : 'border-green-500/50 bg-green-500/10'
                    }`}
                  >
                    {/* New badge */}
                    {isJustAdded && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-green-500 text-[10px] font-bold text-black rounded"
                      >
                        NEW
                      </motion.div>
                    )}

                    {/* Next indicator */}
                    {isNext && isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -left-1 top-1/2 -translate-y-1/2"
                      >
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                          className="text-green-400"
                        >
                          →
                        </motion.span>
                      </motion.div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-green-400"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: index * 0.1 }}
                        />
                        <span className="text-green-400 font-medium">{task.label}</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded">
                        {task.type}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-[#888] font-mono truncate">
                      {'() => { '}
                      {task.callbackCode.substring(0, 30)}
                      {task.callbackCode.length > 30 ? '...' : ''}
                      {' }'}
                    </div>
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
