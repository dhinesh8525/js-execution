import type { Node, File } from '@babel/types'

export interface ParseResult {
  success: boolean
  ast?: File
  errors?: ParseError[]
}

export interface ParseError {
  message: string
  line: number
  column: number
  code?: string
}

export interface TransformContext {
  scopeStack: string[]
  currentScope: string
  nextScopeId: number
  nextCallId: number
  nextAsyncId: number
  sourceCode: string
}

export interface InstrumentationOptions {
  trackReads: boolean
  trackExpressions: boolean
  trackAsyncOperations: boolean
  maxTraceEvents: number
}

export const DEFAULT_INSTRUMENTATION_OPTIONS: InstrumentationOptions = {
  trackReads: true,
  trackExpressions: false,
  trackAsyncOperations: true,
  maxTraceEvents: 10000,
}

export interface NodeMetadata {
  instrumented?: boolean
  scopeId?: string
  originalNode?: Node
}

export type InstrumentedNode = Node & {
  __metadata?: NodeMetadata
}
