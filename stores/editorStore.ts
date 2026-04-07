import { create } from 'zustand'
import { EXAMPLE_SNIPPETS } from '@/lib/constants'
import type { LineHighlight } from '@/engine/simulator'

type ExampleKey = keyof typeof EXAMPLE_SNIPPETS

interface EditorState {
  code: string
  language: 'javascript' | 'typescript'
  cursorLine: number
  cursorColumn: number

  // Line highlights (multiple lines can be highlighted)
  highlights: LineHighlight[]
  // Convenience accessor for primary highlighted line
  highlightedLine: number | null

  isDirty: boolean
  snippetId: string | null

  setCode: (code: string) => void
  setLanguage: (language: 'javascript' | 'typescript') => void
  setCursor: (line: number, column: number) => void

  // Set multiple highlights
  setHighlights: (highlights: LineHighlight[]) => void
  // Legacy single line highlight
  setHighlightedLine: (line: number | null) => void
  // Clear all highlights
  clearHighlights: () => void

  loadExample: (key: ExampleKey) => void
  loadSnippet: (id: string, code: string) => void
  markClean: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  code: EXAMPLE_SNIPPETS.basic.code,
  language: 'javascript',
  cursorLine: 1,
  cursorColumn: 1,
  highlights: [],
  highlightedLine: null,
  isDirty: false,
  snippetId: null,

  setCode: (code) => set({ code, isDirty: true }),
  setLanguage: (language) => set({ language }),
  setCursor: (line, column) => set({ cursorLine: line, cursorColumn: column }),

  setHighlights: (highlights) => set({
    highlights,
    // Set primary highlighted line from first 'executing' highlight
    highlightedLine: highlights.find(h => h.type === 'executing')?.line ?? null,
  }),

  setHighlightedLine: (line) => set({
    highlightedLine: line,
    highlights: line ? [{ line, type: 'executing', label: 'EXECUTING' }] : [],
  }),

  clearHighlights: () => set({ highlights: [], highlightedLine: null }),

  loadExample: (key) =>
    set({
      code: EXAMPLE_SNIPPETS[key].code,
      isDirty: false,
      snippetId: null,
      highlights: [],
      highlightedLine: null,
    }),
  loadSnippet: (id, code) =>
    set({
      code,
      isDirty: false,
      snippetId: id,
      highlights: [],
      highlightedLine: null,
    }),
  markClean: () => set({ isDirty: false }),
}))
