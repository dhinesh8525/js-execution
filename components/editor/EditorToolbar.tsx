'use client'

import { useState } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { useExecutionStore } from '@/stores/executionStore'
import { EXAMPLE_SNIPPETS } from '@/lib/constants'

interface EditorToolbarProps {
  onRun: () => void
  isRunning: boolean
}

export function EditorToolbar({ onRun, isRunning }: EditorToolbarProps) {
  const [showExamples, setShowExamples] = useState(false)
  const { language, setLanguage, loadExample } = useEditorStore()
  const { status, reset } = useExecutionStore()

  const handleExampleSelect = (key: keyof typeof EXAMPLE_SNIPPETS) => {
    loadExample(key)
    reset()
    setShowExamples(false)
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-panel-bg border-b border-panel-border">
      <div className="flex items-center gap-2">
        {/* Run Button */}
        <button
          onClick={onRun}
          disabled={isRunning}
          className="btn btn-primary flex items-center gap-1.5"
        >
          {isRunning ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Running...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.8L16 10l-9.7 7.2V2.8z" />
              </svg>
              Run
            </>
          )}
        </button>

        {/* Examples Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="btn btn-secondary flex items-center gap-1.5"
          >
            Examples
            <svg
              className={`h-4 w-4 transition-transform ${showExamples ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showExamples && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-panel-bg border border-panel-border rounded-lg shadow-lg z-50">
              {Object.entries(EXAMPLE_SNIPPETS).map(([key, snippet]) => (
                <button
                  key={key}
                  onClick={() => handleExampleSelect(key as keyof typeof EXAMPLE_SNIPPETS)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                >
                  {snippet.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <div className="flex items-center bg-editor-bg rounded-md p-0.5">
          <button
            onClick={() => setLanguage('javascript')}
            className={`px-2 py-1 text-xs rounded ${
              language === 'javascript'
                ? 'bg-accent-blue text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            JS
          </button>
          <button
            onClick={() => setLanguage('typescript')}
            className={`px-2 py-1 text-xs rounded ${
              language === 'typescript'
                ? 'bg-accent-blue text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            TS
          </button>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'idle'
                ? 'bg-gray-500'
                : status === 'running'
                ? 'bg-yellow-500 animate-pulse'
                : status === 'complete'
                ? 'bg-green-500'
                : status === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500'
            }`}
          />
          <span className="text-gray-400 capitalize">{status}</span>
        </div>
      </div>
    </div>
  )
}
