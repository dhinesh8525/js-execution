// Local storage fallback for snippets (no database required)

export interface StoredSnippet {
  id: string
  code: string
  language: string
  title?: string
  createdAt: string
}

const STORAGE_KEY = 'js-visualizer-snippets'

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export function saveSnippet(code: string, language = 'javascript', title?: string): string {
  const snippets = getSnippets()
  const id = generateId()

  const snippet: StoredSnippet = {
    id,
    code,
    language,
    title,
    createdAt: new Date().toISOString(),
  }

  snippets.unshift(snippet)

  // Keep only last 50 snippets
  const trimmed = snippets.slice(0, 50)

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  }

  return id
}

export function getSnippet(id: string): StoredSnippet | null {
  const snippets = getSnippets()
  return snippets.find(s => s.id === id) || null
}

export function getSnippets(): StoredSnippet[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function deleteSnippet(id: string): boolean {
  const snippets = getSnippets()
  const filtered = snippets.filter(s => s.id !== id)

  if (filtered.length !== snippets.length) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    }
    return true
  }

  return false
}
