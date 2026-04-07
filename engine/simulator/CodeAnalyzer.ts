/**
 * CodeAnalyzer - AST-based code analysis for event loop simulation
 *
 * Uses Babel to parse JavaScript code and extract operations that
 * affect the event loop (async operations, function calls, etc.)
 */

import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import type { Node } from '@babel/types'
import type { ParsedCode, ParsedOperation } from './types'
import { nanoid } from 'nanoid'

export class CodeAnalyzer {
  private idCounter = 0

  private generateId(): string {
    return `op_${++this.idCounter}`
  }

  /**
   * Parse JavaScript code and extract all event-loop-relevant operations
   */
  analyze(code: string): ParsedCode {
    this.idCounter = 0

    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        errorRecovery: true,
      })

      const operations: ParsedOperation[] = []

      traverse(ast, {
        // Track all statements at program level (synchronous flow)
        Statement: (path) => {
          // Only process top-level statements
          if (path.parent.type !== 'Program') return

          const op = this.analyzeNode(path.node, code)
          if (op) {
            operations.push(op)
          }
        },
      })

      return { success: true, operations }
    } catch (error) {
      return {
        success: false,
        operations: [],
        errors: [
          {
            message: error instanceof Error ? error.message : 'Parse error',
            line: 1,
          },
        ],
      }
    }
  }

  /**
   * Analyze a single AST node and return a ParsedOperation
   */
  private analyzeNode(node: Node, sourceCode: string): ParsedOperation | null {
    const line = node.loc?.start.line ?? 1
    const column = node.loc?.start.column ?? 0
    const code = this.getNodeSource(node, sourceCode)

    switch (node.type) {
      case 'ExpressionStatement':
        return this.analyzeExpression(node.expression, sourceCode, line, column, code)

      case 'VariableDeclaration':
        return this.analyzeVariableDeclaration(node, sourceCode, line, column, code)

      case 'FunctionDeclaration':
        return this.analyzeFunctionDeclaration(node, sourceCode, line, column, code)

      default:
        // For other statements, create a generic operation
        return {
          id: this.generateId(),
          type: 'expression',
          line,
          column,
          code,
          details: { nodeType: node.type },
        }
    }
  }

  /**
   * Analyze expression statements (most async operations are here)
   */
  private analyzeExpression(
    expr: Node,
    sourceCode: string,
    line: number,
    column: number,
    fullCode: string
  ): ParsedOperation | null {
    if (expr.type === 'CallExpression') {
      return this.analyzeCallExpression(expr, sourceCode, line, column, fullCode)
    }

    return {
      id: this.generateId(),
      type: 'expression',
      line,
      column,
      code: fullCode,
      details: {},
    }
  }

  /**
   * Analyze call expressions - this is where we find console.log, setTimeout, etc.
   */
  private analyzeCallExpression(
    node: any,
    sourceCode: string,
    line: number,
    column: number,
    fullCode: string
  ): ParsedOperation {
    const callee = node.callee

    // console.log(), console.warn(), etc.
    if (
      callee.type === 'MemberExpression' &&
      callee.object.type === 'Identifier' &&
      callee.object.name === 'console'
    ) {
      const method = callee.property.name
      const args = node.arguments.map((arg: Node) => this.getNodeSource(arg, sourceCode))
      const value = this.evaluateConsoleArg(node.arguments[0], sourceCode)

      return {
        id: this.generateId(),
        type: 'console-log',
        line,
        column,
        code: fullCode,
        details: {
          method,
          args,
          value,
        },
      }
    }

    // setTimeout(callback, delay)
    if (callee.type === 'Identifier' && callee.name === 'setTimeout') {
      const callback = node.arguments[0]
      const delayArg = node.arguments[1]
      const delay = this.evaluateNumericArg(delayArg) ?? 0
      const callbackCode = this.getNodeSource(callback, sourceCode)
      const callbackBody = this.extractCallbackOperations(callback, sourceCode)

      return {
        id: this.generateId(),
        type: 'setTimeout',
        line,
        column,
        code: fullCode,
        details: {
          delay,
          callbackCode,
        },
        children: callbackBody,
      }
    }

    // setInterval(callback, delay)
    if (callee.type === 'Identifier' && callee.name === 'setInterval') {
      const callback = node.arguments[0]
      const delayArg = node.arguments[1]
      const delay = this.evaluateNumericArg(delayArg) ?? 0
      const callbackCode = this.getNodeSource(callback, sourceCode)
      const callbackBody = this.extractCallbackOperations(callback, sourceCode)

      return {
        id: this.generateId(),
        type: 'setInterval',
        line,
        column,
        code: fullCode,
        details: {
          delay,
          callbackCode,
        },
        children: callbackBody,
      }
    }

    // queueMicrotask(callback)
    if (callee.type === 'Identifier' && callee.name === 'queueMicrotask') {
      const callback = node.arguments[0]
      const callbackCode = this.getNodeSource(callback, sourceCode)
      const callbackBody = this.extractCallbackOperations(callback, sourceCode)

      return {
        id: this.generateId(),
        type: 'queueMicrotask',
        line,
        column,
        code: fullCode,
        details: {
          callbackCode,
        },
        children: callbackBody,
      }
    }

    // Promise.resolve().then() or somePromise.then()
    if (callee.type === 'MemberExpression' && callee.property.name === 'then') {
      return this.analyzePromiseChain(node, sourceCode, line, column, fullCode)
    }

    // Promise.resolve().catch()
    if (callee.type === 'MemberExpression' && callee.property.name === 'catch') {
      const callback = node.arguments[0]
      const callbackCode = this.getNodeSource(callback, sourceCode)
      const callbackBody = this.extractCallbackOperations(callback, sourceCode)

      return {
        id: this.generateId(),
        type: 'promise-catch',
        line,
        column,
        code: fullCode,
        details: { callbackCode },
        children: callbackBody,
      }
    }

    // Generic function call
    const funcName = this.getCalleeName(callee, sourceCode)
    return {
      id: this.generateId(),
      type: 'function-call',
      line,
      column,
      code: fullCode,
      details: {
        functionName: funcName,
        arguments: node.arguments.map((arg: Node) => this.getNodeSource(arg, sourceCode)),
      },
    }
  }

  /**
   * Analyze Promise chains: Promise.resolve().then().then()...
   */
  private analyzePromiseChain(
    node: any,
    sourceCode: string,
    line: number,
    column: number,
    fullCode: string
  ): ParsedOperation {
    const callback = node.arguments[0]
    const callbackCode = callback ? this.getNodeSource(callback, sourceCode) : ''
    const callbackBody = callback ? this.extractCallbackOperations(callback, sourceCode) : []

    // Check if this is Promise.resolve().then()
    const object = node.callee.object
    if (
      object.type === 'CallExpression' &&
      object.callee.type === 'MemberExpression' &&
      object.callee.object.name === 'Promise' &&
      object.callee.property.name === 'resolve'
    ) {
      const resolvedValue = object.arguments[0]
        ? this.getNodeSource(object.arguments[0], sourceCode)
        : 'undefined'

      return {
        id: this.generateId(),
        type: 'promise-resolve-then',
        line,
        column,
        code: fullCode,
        details: {
          resolvedValue,
          callbackCode,
        },
        children: callbackBody,
      }
    }

    // Check for chained .then() on another .then()
    if (object.type === 'CallExpression') {
      const innerOp = this.analyzeCallExpression(
        object,
        sourceCode,
        object.loc?.start.line ?? line,
        object.loc?.start.column ?? column,
        this.getNodeSource(object, sourceCode)
      )

      return {
        id: this.generateId(),
        type: 'promise-then',
        line,
        column,
        code: fullCode,
        details: {
          callbackCode,
          chainedFrom: innerOp,
        },
        children: callbackBody,
      }
    }

    return {
      id: this.generateId(),
      type: 'promise-then',
      line,
      column,
      code: fullCode,
      details: { callbackCode },
      children: callbackBody,
    }
  }

  /**
   * Analyze variable declarations (may contain async operations)
   */
  private analyzeVariableDeclaration(
    node: any,
    sourceCode: string,
    line: number,
    column: number,
    code: string
  ): ParsedOperation {
    const declarations = node.declarations.map((decl: any) => {
      const name = decl.id.name
      const init = decl.init ? this.getNodeSource(decl.init, sourceCode) : null

      // Check if initializer is a promise or async operation
      let initOp: ParsedOperation | null = null
      if (decl.init?.type === 'CallExpression') {
        initOp = this.analyzeCallExpression(
          decl.init,
          sourceCode,
          decl.init.loc?.start.line ?? line,
          decl.init.loc?.start.column ?? column,
          init ?? ''
        )
      }

      return { name, init, initOp }
    })

    return {
      id: this.generateId(),
      type: 'variable-declaration',
      line,
      column,
      code,
      details: {
        kind: node.kind,
        declarations,
      },
    }
  }

  /**
   * Analyze function declarations
   */
  private analyzeFunctionDeclaration(
    node: any,
    sourceCode: string,
    line: number,
    column: number,
    code: string
  ): ParsedOperation {
    const name = node.id?.name ?? 'anonymous'
    const isAsync = node.async
    const params = node.params.map((p: any) => this.getNodeSource(p, sourceCode))

    return {
      id: this.generateId(),
      type: isAsync ? 'async-function' : 'function-declaration',
      line,
      column,
      code,
      details: {
        name,
        isAsync,
        params,
      },
    }
  }

  /**
   * Extract operations from a callback function body
   */
  private extractCallbackOperations(callback: Node, sourceCode: string): ParsedOperation[] {
    const operations: ParsedOperation[] = []

    if (callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression') {
      const body = (callback as any).body

      if (body.type === 'BlockStatement') {
        // Multiple statements in block
        for (const stmt of body.body) {
          const op = this.analyzeNode(stmt, sourceCode)
          if (op) operations.push(op)
        }
      } else {
        // Single expression (arrow function without braces)
        const op = this.analyzeExpression(
          body,
          sourceCode,
          body.loc?.start.line ?? 1,
          body.loc?.start.column ?? 0,
          this.getNodeSource(body, sourceCode)
        )
        if (op) operations.push(op)
      }
    }

    return operations
  }

  /**
   * Try to evaluate a console.log argument to a string
   */
  private evaluateConsoleArg(arg: Node | undefined, sourceCode: string): string {
    if (!arg) return ''

    if (arg.type === 'StringLiteral') {
      return (arg as any).value
    }
    if (arg.type === 'NumericLiteral') {
      return String((arg as any).value)
    }
    if (arg.type === 'TemplateLiteral') {
      // For template literals, just return the source
      return this.getNodeSource(arg, sourceCode)
    }
    if (arg.type === 'Identifier') {
      return `[${(arg as any).name}]`
    }

    return this.getNodeSource(arg, sourceCode)
  }

  /**
   * Try to evaluate a numeric argument (for delays)
   */
  private evaluateNumericArg(arg: Node | undefined): number | null {
    if (!arg) return null

    if (arg.type === 'NumericLiteral') {
      return (arg as any).value
    }

    return null
  }

  /**
   * Get the source code for a node
   */
  private getNodeSource(node: Node, sourceCode: string): string {
    if (node.start != null && node.end != null) {
      return sourceCode.slice(node.start, node.end)
    }
    // Fallback: use generator
    try {
      return generate(node as any).code
    } catch {
      return ''
    }
  }

  /**
   * Get the name of a callee (function being called)
   */
  private getCalleeName(callee: any, sourceCode: string): string {
    if (callee.type === 'Identifier') {
      return callee.name
    }
    if (callee.type === 'MemberExpression') {
      const obj = this.getCalleeName(callee.object, sourceCode)
      const prop = callee.property.name || callee.property.value
      return `${obj}.${prop}`
    }
    return this.getNodeSource(callee, sourceCode)
  }
}
