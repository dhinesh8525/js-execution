'use client'

import { motion } from 'framer-motion'
import type { ConsoleEntry } from '@/types/execution'
import { formatValue } from '@/lib/utils'

interface ConsoleMessageProps {
  entry: ConsoleEntry
  index: number
}

export function ConsoleMessage({ entry, index }: ConsoleMessageProps) {
  const getLevelIcon = () => {
    switch (entry.level) {
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'warn':
        return (
          <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )
    }
  }

  const getLevelClass = () => {
    switch (entry.level) {
      case 'error':
        return 'console-error bg-red-900/20 border-red-900/50'
      case 'warn':
        return 'console-warn bg-yellow-900/20 border-yellow-900/50'
      case 'info':
        return 'console-info bg-blue-900/20 border-blue-900/50'
      default:
        return 'console-log'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`flex items-start gap-2 px-2 py-1.5 border-b border-panel-border text-sm font-mono ${getLevelClass()}`}
    >
      <div className="flex-shrink-0 mt-0.5">{getLevelIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-x-2">
          {entry.args.map((arg, i) => (
            <span key={i} className="break-all">
              {formatValue(arg)}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 text-xs text-gray-500">
        :{entry.location.line}
      </div>
    </motion.div>
  )
}
