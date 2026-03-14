import * as t from '@babel/types'
import type { TransformContext } from '@/types/ast'

// Create a trace call expression: __trace__({ type: '...', ... })
export function createTraceCall(
  type: string,
  properties: Record<string, any>,
  context: TransformContext
): t.ExpressionStatement {
  const props: t.ObjectProperty[] = [
    t.objectProperty(t.identifier('type'), t.stringLiteral(type)),
    t.objectProperty(
      t.identifier('timestamp'),
      t.callExpression(t.memberExpression(t.identifier('Date'), t.identifier('now')), [])
    ),
  ]

  for (const [key, value] of Object.entries(properties)) {
    if (value === undefined) continue

    let valueNode: t.Expression

    if (typeof value === 'string') {
      valueNode = t.stringLiteral(value)
    } else if (typeof value === 'number') {
      valueNode = t.numericLiteral(value)
    } else if (typeof value === 'boolean') {
      valueNode = t.booleanLiteral(value)
    } else if (t.isExpression(value)) {
      valueNode = value
    } else if (value === null) {
      valueNode = t.nullLiteral()
    } else {
      // For complex values, wrap in serialize call
      valueNode = createSerializeCall(value)
    }

    props.push(t.objectProperty(t.identifier(key), valueNode))
  }

  return t.expressionStatement(
    t.callExpression(t.identifier('__trace__'), [t.objectExpression(props)])
  )
}

// Create __serialize__(value) call for runtime serialization
export function createSerializeCall(value: t.Expression): t.CallExpression {
  return t.callExpression(t.identifier('__serialize__'), [value])
}

// Create location object { line, column }
export function createLocationObject(line: number, column: number): t.ObjectExpression {
  return t.objectExpression([
    t.objectProperty(t.identifier('line'), t.numericLiteral(line)),
    t.objectProperty(t.identifier('column'), t.numericLiteral(column)),
  ])
}

// Generate unique scope ID
export function generateScopeId(context: TransformContext): string {
  const id = `scope_${context.nextScopeId++}`
  return id
}

// Generate unique call ID
export function generateCallId(context: TransformContext): string {
  const id = `call_${context.nextCallId++}`
  return id
}

// Generate unique async operation ID
export function generateAsyncId(context: TransformContext): string {
  const id = `async_${context.nextAsyncId++}`
  return id
}

// Wrap value in serialize call for trace
export function wrapValueForTrace(node: t.Expression): t.CallExpression {
  return t.callExpression(t.identifier('__serialize__'), [node])
}

// Create scope enter trace
export function createScopeEnterTrace(
  scopeId: string,
  parentScopeId: string | null,
  scopeType: string,
  name: string,
  line: number,
  column: number
): t.ExpressionStatement {
  return t.expressionStatement(
    t.callExpression(t.identifier('__trace__'), [
      t.objectExpression([
        t.objectProperty(t.identifier('type'), t.stringLiteral('scope_enter')),
        t.objectProperty(
          t.identifier('timestamp'),
          t.callExpression(t.memberExpression(t.identifier('Date'), t.identifier('now')), [])
        ),
        t.objectProperty(t.identifier('scopeId'), t.stringLiteral(scopeId)),
        t.objectProperty(
          t.identifier('parentScopeId'),
          parentScopeId ? t.stringLiteral(parentScopeId) : t.nullLiteral()
        ),
        t.objectProperty(t.identifier('scopeType'), t.stringLiteral(scopeType)),
        t.objectProperty(t.identifier('name'), t.stringLiteral(name)),
        t.objectProperty(t.identifier('location'), createLocationObject(line, column)),
      ]),
    ])
  )
}

// Create scope exit trace
export function createScopeExitTrace(scopeId: string, line: number, column: number): t.ExpressionStatement {
  return t.expressionStatement(
    t.callExpression(t.identifier('__trace__'), [
      t.objectExpression([
        t.objectProperty(t.identifier('type'), t.stringLiteral('scope_exit')),
        t.objectProperty(
          t.identifier('timestamp'),
          t.callExpression(t.memberExpression(t.identifier('Date'), t.identifier('now')), [])
        ),
        t.objectProperty(t.identifier('scopeId'), t.stringLiteral(scopeId)),
        t.objectProperty(t.identifier('location'), createLocationObject(line, column)),
      ]),
    ])
  )
}
