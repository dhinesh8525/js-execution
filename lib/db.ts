// Database stub - using localStorage fallback
// This module is a placeholder for when database is set up

export const prisma = null

// localStorage-based snippet storage
export interface StoredSnippet {
  id: string
  code: string
  language: string
  title?: string
  createdAt: string
}

const STORAGE_KEY = 'js-visualizer-snippets'

export function saveSnippet(snippet: Omit<StoredSnippet, 'id' | 'createdAt'>): StoredSnippet {
  const snippets = getSnippets()
  const newSnippet: StoredSnippet = {
    ...snippet,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  snippets.push(newSnippet)
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets))
  }
  return newSnippet
}

export function getSnippets(): StoredSnippet[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function getSnippetById(id: string): StoredSnippet | null {
  const snippets = getSnippets()
  return snippets.find((s) => s.id === id) || null
}
