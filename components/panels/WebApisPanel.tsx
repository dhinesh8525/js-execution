'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'
import { useMemo } from 'react'

export function WebApisPanel() {
  const webApiTimers = useExecutionStore((s) => s.webApiTimers)
  const stepDiff = useExecutionStore((s) => s.stepDiff)

  // Track which items were just added
  const justAddedIds = useMemo(() => {
    if (!stepDiff) return new Set<string>()
    return new Set(stepDiff.addedTimers.map((t) => t.id))
  }, [stepDiff])

  return (
    <div id="webapi-panel" className="panel h-full flex flex-col">
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-orange-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>WEB APIS</span>
        </div>
        <span className="text-xs font-normal normal-case text-[#666]">{webApiTimers.length} PENDING</span>
      </div>

      <div className="panel-content flex-1 overflow-auto">
        <AnimatePresence mode="popLayout">
          {webApiTimers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <svg className="w-8 h-8 text-[#333] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="text-xs text-[#666]">No pending timers</span>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {webApiTimers.map((timer, index) => {
                const isJustAdded = justAddedIds.has(timer.id)
                const progressPercent =
                  timer.delay > 0 ? ((timer.delay - timer.remaining) / timer.delay) * 100 : 100

                return (
                  <motion.div
                    key={timer.id}
                    data-connection-id={timer.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      boxShadow: isJustAdded
                        ? [
                            '0 0 0 2px rgba(249, 115, 22, 0.5)',
                            '0 0 20px 4px rgba(249, 115, 22, 0.3)',
                            '0 0 0 2px rgba(249, 115, 22, 0)',
                          ]
                        : 'none',
                    }}
                    exit={{ opacity: 0, scale: 0.9, x: 50 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                      delay: index * 0.05,
                      boxShadow: { duration: 0.6, times: [0, 0.3, 1] },
                    }}
                    className="rounded-lg border-2 border-orange-500/50 bg-orange-500/10 p-3 relative"
                  >
                    {/* New badge */}
                    {isJustAdded && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-orange-500 text-[10px] font-bold text-black rounded"
                      >
                        NEW
                      </motion.div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-orange-400"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="text-orange-400 font-medium">{timer.label}</span>
                      </div>
                      <span className="text-xs text-orange-400/70">{timer.remaining}ms</span>
                    </div>
                    <div className="mt-2 text-xs text-[#888] font-mono truncate">
                      {'() => { '}
                      {timer.callbackCode.substring(0, 30)}
                      {timer.callbackCode.length > 30 ? '...' : ''}
                      {' }'}
                    </div>
                    {/* Progress bar for timer */}
                    <div className="mt-2 h-1 bg-[#333] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-orange-400"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.3, ease: 'linear' }}
                      />
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
