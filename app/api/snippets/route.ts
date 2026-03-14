import { NextRequest, NextResponse } from 'next/server'

// In-memory storage fallback (for SSR/API routes)
// For full persistence, snippets are stored in localStorage on the client
const memoryStore = new Map<string, { code: string; language: string; title?: string; createdAt: string }>()

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, language = 'javascript', title } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    if (code.length > 50000) {
      return NextResponse.json(
        { error: 'Code exceeds maximum length (50000 characters)' },
        { status: 400 }
      )
    }

    const id = generateId()
    memoryStore.set(id, {
      code,
      language,
      title: title || undefined,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    console.error('Failed to save snippet:', error)
    return NextResponse.json({ error: 'Failed to save snippet' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const snippets = Array.from(memoryStore.entries()).map(([id, data]) => ({
      id,
      title: data.title,
      language: data.language,
      createdAt: data.createdAt,
    }))

    return NextResponse.json(snippets)
  } catch (error) {
    console.error('Failed to fetch snippets:', error)
    return NextResponse.json({ error: 'Failed to fetch snippets' }, { status: 500 })
  }
}
