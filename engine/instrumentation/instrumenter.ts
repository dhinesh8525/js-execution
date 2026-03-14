import * as parser from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import * as t from '@babel/types'
import type { InstrumentationResult } from '@/types/execution'

// Simple instrumentation that wraps code with tracing
export function instrumentCode(code: string): InstrumentationResult {
  try {
    const ast = parser.parse(code, {
      sourceType: 'script',
      plugins: [],
    })

    let scopeCounter = 0
    const scopeStack: string[] = ['global']

    const getCurrentScope = () => scopeStack[scopeStack.length - 1]

    traverse(ast, {
      // Mark all nodes to track what we've processed
      enter(path) {
        if ((path.node as any).__skip) {
          path.skip()
        }
      },

      // Variable declarations
      VariableDeclaration: {
        exit(path) {
          if ((path.node as any).__traced) return
          (path.node as any).__traced = true

          const { node } = path
          const kind = node.kind

          for (const decl of node.declarations) {
            if (!t.isIdentifier(decl.id)) continue

            const name = decl.id.name
            const line = decl.loc?.start?.line || 0

            const traceStmt = createTraceStatement('declare', {
              name: t.stringLiteral(name),
              kind: t.stringLiteral(kind),
              line: t.numericLiteral(line),
              scopeId: t.stringLiteral(getCurrentScope()),
            })
            markSkip(traceStmt)

            path.insertAfter(traceStmt)
          }
        },
      },

      // Function declarations - inject tracing at start of body
      FunctionDeclaration(path) {
        if ((path.node as any).__traced) return
        (path.node as any).__traced = true

        const { node } = path
        if (!node.id || !t.isBlockStatement(node.body)) return

        const funcName = node.id.name
        const line = node.loc?.start?.line || 0
        const scopeId = `scope_${++scopeCounter}`

        // Push scope
        scopeStack.push(scopeId)

        // Create scope enter trace
        const enterTrace = createTraceStatement('scope_enter', {
          scopeId: t.stringLiteral(scopeId),
          name: t.stringLiteral(funcName),
          type: t.stringLiteral('function'),
          line: t.numericLiteral(line),
        })
        markSkip(enterTrace)

        // Parameter traces
        const paramTraces = node.params
          .filter((p): p is t.Identifier => t.isIdentifier(p))
          .map((param) => {
            const trace = createTraceStatement('declare', {
              name: t.stringLiteral(param.name),
              kind: t.stringLiteral('param'),
              line: t.numericLiteral(line),
              scopeId: t.stringLiteral(scopeId),
            })
            markSkip(trace)
            return trace
          })

        // Inject at start of function body
        node.body.body.unshift(enterTrace, ...paramTraces)

        // Pop scope after traversing children
        path.traverse({
          exit(innerPath) {
            if (innerPath.node === node) {
              scopeStack.pop()
            }
          },
        })
      },

      // Console calls - special handling
      CallExpression(path) {
        if ((path.node as any).__traced) return

        const { node } = path
        const callee = node.callee

        // Only trace console.log/warn/error
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: 'console' }) &&
          t.isIdentifier(callee.property)
        ) {
          (path.node as any).__traced = true

          const method = callee.property.name
          const line = node.loc?.start?.line || 0

          // Create a trace call before the console call
          const traceStmt = createTraceStatement('console', {
            level: t.stringLiteral(method),
            line: t.numericLiteral(line),
          })
          markSkip(traceStmt)

          // Insert before if we're in a statement context
          if (path.parentPath?.isExpressionStatement()) {
            path.parentPath.insertBefore(traceStmt)
          }
        }
      },
    })

    const output = generate(ast, { retainLines: true })
    const instrumentedCode = wrapWithRuntime(output.code)

    return {
      success: true,
      instrumentedCode,
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          message: error instanceof Error ? error.message : 'Instrumentation failed',
          location: { line: 0, column: 0 },
        },
      ],
    }
  }
}

function markSkip(node: t.Node) {
  (node as any).__skip = true
  return node
}

function createTraceStatement(
  type: string,
  props: Record<string, t.Expression>
): t.ExpressionStatement {
  const properties = [
    t.objectProperty(t.identifier('type'), t.stringLiteral(type)),
    t.objectProperty(
      t.identifier('timestamp'),
      t.callExpression(
        t.memberExpression(t.identifier('Date'), t.identifier('now')),
        []
      )
    ),
    ...Object.entries(props).map(([key, value]) =>
      t.objectProperty(t.identifier(key), value)
    ),
  ]

  return t.expressionStatement(
    t.callExpression(t.identifier('__trace__'), [t.objectExpression(properties)])
  )
}

function wrapWithRuntime(code: string): string {
  return `
var __events__ = [];
var __maxEvents__ = 5000;

function __trace__(event) {
  if (__events__.length < __maxEvents__) {
    __events__.push(event);
    self.postMessage({ type: 'trace', event: event });
  }
}

__trace__({
  type: 'scope_enter',
  timestamp: Date.now(),
  scopeId: 'global',
  name: 'Global',
  scopeType: 'global',
  line: 0
});

try {
${code}
} catch (error) {
  __trace__({
    type: 'error',
    timestamp: Date.now(),
    message: error.message,
    stack: error.stack,
    line: 0
  });
}

__trace__({
  type: 'scope_exit',
  timestamp: Date.now(),
  scopeId: 'global',
  line: 0
});

self.postMessage({ type: 'complete', events: __events__ });
`
}
