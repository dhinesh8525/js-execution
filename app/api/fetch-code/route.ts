import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL is from GeeksforGeeks or other allowed domains
    const allowedDomains = ['geeksforgeeks.org', 'www.geeksforgeeks.org']
    const urlObj = new URL(url)

    if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return NextResponse.json(
        { error: 'Only GeeksforGeeks URLs are supported' },
        { status: 400 }
      )
    }

    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: ${response.status}` },
        { status: response.status }
      )
    }

    const html = await response.text()

    // Extract JavaScript code from the page
    const code = extractJavaScriptCode(html)

    if (!code) {
      return NextResponse.json(
        { error: 'No JavaScript code found on this page' },
        { status: 404 }
      )
    }

    // Extract title from the page
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    const title = titleMatch
      ? titleMatch[1].replace(' - GeeksforGeeks', '').trim()
      : 'GeeksforGeeks Example'

    return NextResponse.json({ code, title })
  } catch (error) {
    console.error('Error fetching code:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch code' },
      { status: 500 }
    )
  }
}

function extractJavaScriptCode(html: string): string | null {
  // Try multiple patterns to find JavaScript code blocks

  // Pattern 1: Code in <code> tags with JavaScript class
  const codeBlockPatterns = [
    // GFG specific code containers
    /<code[^>]*class="[^"]*language-javascript[^"]*"[^>]*>([\s\S]*?)<\/code>/gi,
    /<code[^>]*class="[^"]*javascript[^"]*"[^>]*>([\s\S]*?)<\/code>/gi,
    /<pre[^>]*class="[^"]*language-javascript[^"]*"[^>]*>([\s\S]*?)<\/pre>/gi,
    // Generic code blocks
    /<code[^>]*>([\s\S]*?)<\/code>/gi,
    /<pre[^>]*>([\s\S]*?)<\/pre>/gi,
    // GFG specific containers
    /<div[^>]*class="[^"]*code-container[^"]*"[^>]*>[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>/gi,
    /<td[^>]*class="[^"]*code[^"]*"[^>]*>([\s\S]*?)<\/td>/gi,
  ]

  let bestCode: string | null = null
  let bestScore = 0

  for (const pattern of codeBlockPatterns) {
    let match
    while ((match = pattern.exec(html)) !== null) {
      const codeContent = decodeHTMLEntities(match[1])
        .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
        .trim()

      // Score the code based on JavaScript indicators
      const score = scoreJavaScriptCode(codeContent)

      if (score > bestScore && codeContent.length > 20) {
        bestScore = score
        bestCode = codeContent
      }
    }
  }

  // Clean up the code
  if (bestCode) {
    bestCode = cleanupCode(bestCode)
  }

  return bestCode
}

function scoreJavaScriptCode(code: string): number {
  let score = 0

  // JavaScript keywords
  const keywords = [
    'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while',
    'console.log', 'setTimeout', 'Promise', 'async', 'await', 'new', 'class',
    'forEach', 'map', 'filter', 'reduce', 'push', 'pop', 'shift', 'unshift'
  ]

  for (const keyword of keywords) {
    if (code.includes(keyword)) {
      score += 10
    }
  }

  // Bonus for function declarations
  if (/function\s+\w+\s*\(/.test(code)) score += 20
  if (/const\s+\w+\s*=/.test(code)) score += 15
  if (/let\s+\w+\s*=/.test(code)) score += 15
  if (/console\.log/.test(code)) score += 25

  // Penalty for non-JavaScript indicators
  if (code.includes('#include')) score -= 50
  if (code.includes('public static void')) score -= 50
  if (code.includes('def ') && code.includes(':')) score -= 30
  if (code.includes('System.out.println')) score -= 50

  return score
}

function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#32;': ' ',
    '&apos;': "'",
  }

  let result = text
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char)
  }

  // Handle numeric entities
  result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))

  return result
}

function cleanupCode(code: string): string {
  return code
    // Remove leading/trailing whitespace from each line
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    // Remove excessive blank lines
    .replace(/\n{3,}/g, '\n\n')
    // Trim the whole thing
    .trim()
}
