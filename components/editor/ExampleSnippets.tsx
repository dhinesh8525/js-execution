'use client'

import { EXAMPLE_SNIPPETS, EXAMPLE_CATEGORIES, type ExampleKey } from '@/lib/constants'
import { useEditorStore } from '@/stores/editorStore'
import { useExecutionStore } from '@/stores/executionStore'

interface ExampleSnippetsProps {
  onSelect?: () => void
}

export function ExampleSnippets({ onSelect }: ExampleSnippetsProps) {
  const { loadExample } = useEditorStore()
  const { reset } = useExecutionStore()

  const handleSelect = (key: ExampleKey) => {
    loadExample(key)
    reset()
    onSelect?.()
  }

  // Group examples by their category
  const groupedExamples = Object.entries(EXAMPLE_SNIPPETS).reduce(
    (acc, [key, example]) => {
      const category = example.category
      if (!acc[category]) acc[category] = []
      acc[category].push(key as ExampleKey)
      return acc
    },
    {} as Record<string, ExampleKey[]>
  )

  return (
    <div className="space-y-4">
      {Object.entries(EXAMPLE_CATEGORIES).map(([categoryKey, categoryInfo]) => {
        const examples = groupedExamples[categoryKey] || []
        if (examples.length === 0) return null

        return (
          <div key={categoryKey}>
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              {categoryInfo.label}
            </h4>
            <div className="space-y-1">
              {examples.map((key) => {
                const example = EXAMPLE_SNIPPETS[key]
                return (
                  <button
                    key={key}
                    onClick={() => handleSelect(key)}
                    className="w-full px-3 py-2 text-left text-sm bg-editor-bg hover:bg-gray-700 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white">{example.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#333] rounded text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {example.complexity.time}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
