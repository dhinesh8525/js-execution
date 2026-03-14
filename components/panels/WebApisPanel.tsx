'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'

export function WebApisPanel() {
  const webApis = useExecutionStore((s) => s.webApis)

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>WEB APIS</span>
        </div>
        <span className="text-xs font-normal normal-case text-[#666]">
          {webApis.length} PENDING
        </span>
      </div>

      <div className="panel-content flex-1 overflow-auto">
        <AnimatePresence mode="popLayout">
          {webApis.length === 0 ? (
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
              {webApis.map((api, index) => (
                <motion.div
                  key={api.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: 50 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25, delay: index * 0.05 }}
                  className="rounded-lg border-2 border-orange-500/50 bg-orange-500/10 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-orange-400"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-orange-400 font-medium">{api.name}</span>
                    </div>
                    <span className="text-xs text-orange-400/70">{api.delay}ms</span>
                  </div>
                  <div className="mt-2 text-xs text-[#888] font-mono truncate">
                    {'() => { '}{api.callback.substring(0, 30)}{api.callback.length > 30 ? '...' : ''}{' }'}
                  </div>
                  {/* Progress bar for timer */}
                  <div className="mt-2 h-1 bg-[#333] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-orange-400"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: api.delay / 1000 || 0.5, ease: 'linear' }}
                    />
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
