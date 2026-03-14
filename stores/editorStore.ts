import { create } from 'zustand'
import { EXAMPLE_SNIPPETS } from '@/lib/constants'

type ExampleKey = keyof typeof EXAMPLE_SNIPPETS

interface EditorState {
  code: string
  language: 'javascript' | 'typescript'
  cursorLine: number
  cursorColumn: number
  highlightedLine: number | null
  isDirty: boolean
  snippetId: string | null

  setCode: (code: string) => void
  setLanguage: (language: 'javascript' | 'typescript') => void
  setCursor: (line: number, column: number) => void
  setHighlightedLine: (line: number | null) => void
  loadExample: (key: ExampleKey) => void
  loadSnippet: (id: string, code: string) => void
  markClean: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  code: EXAMPLE_SNIPPETS.basic.code,
  language: 'javascript',
  cursorLine: 1,
  cursorColumn: 1,
  highlightedLine: null,
  isDirty: false,
  snippetId: null,

  setCode: (code) => set({ code, isDirty: true }),
  setLanguage: (language) => set({ language }),
  setCursor: (line, column) => set({ cursorLine: line, cursorColumn: column }),
  setHighlightedLine: (line) => set({ highlightedLine: line }),
  loadExample: (key) =>
    set({
      code: EXAMPLE_SNIPPETS[key].code,
      isDirty: false,
      snippetId: null,
    }),
  loadSnippet: (id, code) =>
    set({
      code,
      isDirty: false,
      snippetId: id,
    }),
  markClean: () => set({ isDirty: false }),
}))
