import { NextRequest, NextResponse } from 'next/server'

// Shared memory store (same as parent route)
const memoryStore = new Map<string, { code: string; language: string; title?: string; createdAt: string }>()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const snippet = memoryStore.get(id)

    if (!snippet) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 })
    }

    return NextResponse.json({ id, ...snippet })
  } catch (error) {
    console.error('Failed to fetch snippet:', error)
    return NextResponse.json({ error: 'Failed to fetch snippet' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const deleted = memoryStore.delete(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete snippet:', error)
    return NextResponse.json({ error: 'Failed to delete snippet' }, { status: 500 })
  }
}
