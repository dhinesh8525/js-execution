'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'

export function TaskQueuePanel() {
  const taskQueue = useExecutionStore((s) => s.taskQueue)

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-lg">↻</span>
          <div>
            <span>TASK QUEUE</span>
            <span className="text-[10px] text-[#666] ml-1">(MACROTASKS)</span>
          </div>
        </div>
        <span className="text-xs font-normal normal-case text-[#666]">
          {taskQueue.length} TASKS
        </span>
      </div>

      <div className="panel-content flex-1 overflow-auto">
        <AnimatePresence mode="popLayout">
          {taskQueue.length === 0 ? (
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
              {taskQueue.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25, delay: index * 0.05 }}
                  className="rounded-lg border-2 border-green-500/50 bg-green-500/10 p-3"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-400"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: index * 0.1 }}
                    />
                    <span className="text-green-400 font-medium">{task.name}</span>
                  </div>
                  <div className="mt-2 text-xs text-[#888] font-mono truncate">
                    {'() => { '}{task.callback.substring(0, 30)}{task.callback.length > 30 ? '...' : ''}{' }'}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
