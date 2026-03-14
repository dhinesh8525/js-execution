import * as parser from '@babel/parser'
import type { File } from '@babel/types'
import type { ParseResult, ParseError } from '@/types/ast'

export function parseCode(code: string, isTypeScript = false): ParseResult {
  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        ...(isTypeScript ? ['typescript' as const] : []),
      ],
      errorRecovery: true,
    })

    // Check for parsing errors
    const errors: ParseError[] = (ast.errors || []).map((err: any) => ({
      message: err.message || 'Parse error',
      line: err.loc?.line || 1,
      column: err.loc?.column || 0,
      code: err.code,
    }))

    if (errors.length > 0 && errors.some((e) => e.code === 'BABEL_PARSER_SYNTAX_ERROR')) {
      return { success: false, errors }
    }

    return { success: true, ast }
  } catch (error) {
    const err = error as any
    return {
      success: false,
      errors: [
        {
          message: err.message || 'Failed to parse code',
          line: err.loc?.line || 1,
          column: err.loc?.column || 0,
        },
      ],
    }
  }
}

export function getNodeLocation(node: any): { line: number; column: number; start: number; end: number } {
  return {
    line: node.loc?.start?.line || 0,
    column: node.loc?.start?.column || 0,
    start: node.start || 0,
    end: node.end || 0,
  }
}
