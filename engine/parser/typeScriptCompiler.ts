import * as Babel from '@babel/standalone'

export async function compileTypeScript(code: string): Promise<{
  success: boolean
  code?: string
  error?: string
}> {
  try {
    const result = Babel.transform(code, {
      presets: ['typescript'],
      filename: 'code.tsx',
      sourceType: 'module',
    })

    if (result?.code) {
      return { success: true, code: result.code }
    }

    return { success: false, error: 'TypeScript compilation produced no output' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'TypeScript compilation failed',
    }
  }
}

export function isTypeScriptCode(code: string): boolean {
  // Simple heuristics to detect TypeScript
  const tsPatterns = [
    /:\s*(string|number|boolean|any|void|never|unknown|object)\b/,
    /interface\s+\w+/,
    /type\s+\w+\s*=/,
    /<\w+>/,
    /as\s+(const|string|number|any)/,
    /:\s*\w+\[\]/,
  ]

  return tsPatterns.some((pattern) => pattern.test(code))
}
