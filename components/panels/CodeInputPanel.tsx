'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditorStore } from '@/stores/editorStore'
import { useExecutionStore } from '@/stores/executionStore'
import { EXAMPLE_SNIPPETS, EXAMPLE_CATEGORIES, type ExampleKey } from '@/lib/constants'

interface CodeInputPanelProps {
  onRun: () => void
  isRunning: boolean
}

export function CodeInputPanel({ onRun, isRunning }: CodeInputPanelProps) {
  const [showExamples, setShowExamples] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isFetchingUrl, setIsFetchingUrl] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [fetchedTitle, setFetchedTitle] = useState<string | null>(null)
  const { code, setCode, loadExample, highlightedLine } = useEditorStore()
  const currentLabel = useExecutionStore((s) => s.currentLabel)
  const [selectedExample, setSelectedExample] = useState<ExampleKey | null>('basic')
  const [isCustomCode, setIsCustomCode] = useState(false)
  const [isFromUrl, setIsFromUrl] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleExampleSelect = (key: ExampleKey) => {
    loadExample(key)
    setSelectedExample(key)
    setIsCustomCode(false)
    setIsFromUrl(false)
    setFetchedTitle(null)
    setShowExamples(false)
  }

  const handleCustomCode = () => {
    setIsCustomCode(true)
    setIsFromUrl(false)
    setSelectedExample(null)
    setFetchedTitle(null)
    setCode('// Write your own JavaScript code here\nconsole.log("Hello, World!");\n')
  }

  const handleFetchFromUrl = async () => {
    if (!urlInput.trim()) {
      setUrlError('Please enter a URL')
      return
    }

    // Basic URL validation
    try {
      new URL(urlInput)
    } catch {
      setUrlError('Please enter a valid URL')
      return
    }

    setIsFetchingUrl(true)
    setUrlError(null)

    try {
      const response = await fetch('/api/fetch-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch code')
      }

      setCode(data.code)
      setFetchedTitle(data.title)
      setIsFromUrl(true)
      setIsCustomCode(false)
      setSelectedExample(null)
      setUrlInput('')
    } catch (error) {
      setUrlError(error instanceof Error ? error.message : 'Failed to fetch code')
    } finally {
      setIsFetchingUrl(false)
    }
  }

  const currentExample = selectedExample ? EXAMPLE_SNIPPETS[selectedExample] : null
  const lines = code.split('\n')

  // Group examples by category
  const groupedExamples = Object.entries(EXAMPLE_SNIPPETS).reduce((acc, [key, value]) => {
    const cat = value.category || 'basics'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push({ key: key as ExampleKey, ...value })
    return acc
  }, {} as Record<string, Array<{ key: ExampleKey } & typeof EXAMPLE_SNIPPETS[ExampleKey]>>)

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
        </svg>
        <span>CODE INPUT</span>
      </div>

      <div className="px-4 pb-3 space-y-3">
        {/* URL Input Section */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-[#666]">
            Import from GeeksforGeeks
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value)
                setUrlError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFetchFromUrl()
              }}
              placeholder="Paste GeeksforGeeks URL..."
              className="flex-1 px-3 py-2 rounded-lg bg-[#252525] border border-[#333] text-white text-sm placeholder-[#666] focus:outline-none focus:border-green-500 transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFetchFromUrl}
              disabled={isFetchingUrl || !urlInput.trim()}
              className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 text-sm font-medium hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isFetchingUrl ? (
                <motion.svg
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </motion.svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              <span>Fetch</span>
            </motion.button>
          </div>
          <AnimatePresence>
            {urlError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-red-400 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {urlError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#666]">
          <div className="flex-1 h-px bg-[#333]" />
          <span>or</span>
          <div className="flex-1 h-px bg-[#333]" />
        </div>

        {/* Write Custom Code Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleCustomCode}
          className={`w-full p-3 rounded-lg border text-left transition-all group ${
            isCustomCode
              ? 'bg-blue-500/10 border-blue-500/50'
              : 'bg-[#252525] border-[#333] hover:border-[#444]'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className={`w-5 h-5 ${isCustomCode ? 'text-blue-400' : 'text-[#666] group-hover:text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div>
              <div className={`font-medium ${isCustomCode ? 'text-blue-400' : 'text-white'}`}>Write Custom Code</div>
              <div className="text-xs text-[#666]">Write your own JavaScript to visualize</div>
            </div>
          </div>
        </motion.button>

        <div className="flex items-center gap-3 text-xs text-[#666]">
          <div className="flex-1 h-px bg-[#333]" />
          <span>or choose an example</span>
          <div className="flex-1 h-px bg-[#333]" />
        </div>

        {/* Example Dropdown */}
        <div className="relative">
          <div className="text-[10px] uppercase tracking-wider text-[#666] mb-1">
            {isFromUrl ? 'From URL' : isCustomCode ? 'Custom' : 'Read-Only'}
          </div>
          <motion.button
            whileHover={{ scale: 1.005 }}
            onClick={() => setShowExamples(!showExamples)}
            className="w-full p-3 rounded-lg bg-[#252525] border border-[#333] flex items-center justify-between hover:border-[#444] transition-colors"
          >
            <span className="text-white truncate">
              {isFromUrl && fetchedTitle ? fetchedTitle : currentExample?.title || 'Select an example'}
            </span>
            <motion.svg
              animate={{ rotate: showExamples ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-[#666] flex-shrink-0 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </motion.button>

          <AnimatePresence>
            {showExamples && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden z-50 shadow-2xl max-h-80 overflow-y-auto"
              >
                {Object.entries(EXAMPLE_CATEGORIES).map(([catKey, catInfo]) => (
                  <div key={catKey}>
                    <div className="px-3 py-2 text-xs font-semibold text-[#666] uppercase tracking-wider bg-[#151515] sticky top-0">
                      {catInfo.label}
                    </div>
                    {groupedExamples[catKey]?.map((example, idx) => (
                      <motion.button
                        key={example.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => handleExampleSelect(example.key)}
                        className="w-full px-3 py-2 text-left hover:bg-[#252525] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {selectedExample === example.key && (
                              <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-4 h-4 text-blue-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </motion.svg>
                            )}
                            <span className={selectedExample === example.key ? 'text-blue-400' : 'text-white'}>
                              {example.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                              {example.complexity.time}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                              {example.complexity.space}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Example Info */}
        {currentExample && !isFromUrl && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-start gap-2 text-xs text-[#888]">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{currentExample.description}</span>
            </div>

            {/* Complexity Badges */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/30">
                <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[10px] text-green-400 font-medium">Time: {currentExample.complexity.time}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
                </svg>
                <span className="text-[10px] text-purple-400 font-medium">Space: {currentExample.complexity.space}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* URL Source Info */}
        {isFromUrl && fetchedTitle && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 text-xs text-[#888]"
          >
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Loaded from GeeksforGeeks: {fetchedTitle}</span>
          </motion.div>
        )}
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-auto px-2 pb-2 font-mono text-sm">
        {isCustomCode ? (
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-transparent resize-none focus:outline-none text-white p-2"
            placeholder="// Write your code here..."
            spellCheck={false}
          />
        ) : (
          lines.map((line, index) => {
            const lineNum = index + 1
            const isHighlighted = highlightedLine === lineNum

            return (
              <motion.div
                key={index}
                className={`code-line ${isHighlighted ? 'executing' : ''}`}
                animate={isHighlighted ? {
                  backgroundColor: ['rgba(59, 130, 246, 0)', 'rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.15)'],
                } : { backgroundColor: 'transparent' }}
                transition={{ duration: 0.3 }}
              >
                <span className="line-number">{lineNum}</span>
                <span className="flex-1">
                  <SyntaxHighlight code={line} />
                </span>
                <AnimatePresence>
                  {isHighlighted && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8, x: 10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 10 }}
                      className="executing-badge"
                    >
                      {currentLabel || 'EXECUTING'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Run Button */}
      <div className="p-3 border-t border-[#333]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRun}
          disabled={isRunning}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-400 hover:to-cyan-400 disabled:from-[#333] disabled:to-[#333] disabled:text-[#666] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
        >
          {isRunning ? (
            <>
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </motion.svg>
              <span>Running...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Run Code</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}

function SyntaxHighlight({ code }: { code: string }) {
  const keywords = /\b(const|let|var|function|return|if|else|for|while|class|new|this|async|await|import|export|from|try|catch|throw|typeof|instanceof)\b/g
  const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g
  const numbers = /\b(\d+\.?\d*)\b/g
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
  const functions = /\b([a-zA-Z_]\w*)\s*(?=\()/g

  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  html = html.replace(comments, '<span class="text-[#6a737d]">$1</span>')
  html = html.replace(strings, '<span class="text-[#ce9178]">$&</span>')
  html = html.replace(keywords, '<span class="text-[#c586c0]">$1</span>')
  html = html.replace(functions, '<span class="text-[#dcdcaa]">$1</span>')
  html = html.replace(numbers, '<span class="text-[#b5cea8]">$1</span>')

  return <span dangerouslySetInnerHTML={{ __html: html }} />
}
