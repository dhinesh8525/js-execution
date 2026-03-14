'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useExecutionStore } from '@/stores/executionStore'

export function ConsolePanel() {
  const consoleOutput = useExecutionStore((s) => s.consoleOutput)
  const error = useExecutionStore((s) => s.error)

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg text-cyan-400">{'>_'}</span>
          <span>CONSOLE</span>
        </div>
        <span className="text-xs font-normal normal-case text-[#666]">
          {consoleOutput.length} OUTPUTS
        </span>
      </div>

      <div className="flex-1 overflow-auto bg-[#0a0a0a]">
        <AnimatePresence mode="popLayout">
          {consoleOutput.length === 0 && !error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full text-[#666] text-sm"
            >
              Console output will appear here
            </motion.div>
          ) : (
            <div className="p-2 space-y-1">
              {consoleOutput.map((entry, index) => (
                <motion.div
                  key={`${entry.line}-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30, delay: index * 0.02 }}
                  className="flex items-center gap-3 py-1.5 px-2 rounded bg-[#111] hover:bg-[#1a1a1a] transition-colors"
                >
                  <motion.span
                    className="text-cyan-500"
                    whileHover={{ scale: 1.1 }}
                  >
                    {'>'}
                  </motion.span>
                  <span className="flex-1 text-white font-mono text-sm">
                    "{entry.value}"
                  </span>
                  {entry.line > 0 && (
                    <span className="text-[#555] text-xs">:{entry.line}</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="m-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30"
            >
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Error</span>
              </div>
              <div className="text-red-300 text-sm">{error.message}</div>
              {error.line && (
                <div className="text-red-400/60 text-xs mt-1">at line {error.line}</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
