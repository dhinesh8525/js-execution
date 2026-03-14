import type { NodePath } from '@babel/traverse'
import * as t from '@babel/types'
import type { TransformContext } from '@/types/ast'
import {
  createTraceCall,
  createScopeEnterTrace,
  createScopeExitTrace,
  createLocationObject,
  wrapValueForTrace,
  generateScopeId,
  generateCallId,
} from './traceInjector'

export function createVisitors(context: TransformContext) {
  return {
    // Variable declarations: let x = 5;
    VariableDeclaration(path: NodePath<t.VariableDeclaration>) {
      const { node } = path
      if ((node as any).__instrumented) return

      const kind = node.kind // 'var' | 'let' | 'const'
      const declarations = node.declarations

      const traceStatements: t.Statement[] = []

      for (const decl of declarations) {
        if (!t.isIdentifier(decl.id)) continue

        const name = decl.id.name
        const line = decl.loc?.start.line || 0
        const column = decl.loc?.start.column || 0

        // Create trace for declaration
        const traceCall = t.expressionStatement(
          t.callExpression(t.identifier('__trace__'), [
            t.objectExpression([
              t.objectProperty(t.identifier('type'), t.stringLiteral('declare')),
              t.objectProperty(
                t.identifier('timestamp'),
                t.callExpression(t.memberExpression(t.identifier('Date'), t.identifier('now')), [])
              ),
              t.objectProperty(t.identifier('name'), t.stringLiteral(name)),
              t.objectProperty(
                t.identifier('value'),
                decl.init ? wrapValueForTrace(t.cloneNode(decl.init)) : t.identifier('undefined')
              ),
              t.objectProperty(t.identifier('declarationType'), t.stringLiteral(kind)),
              t.objectProperty(t.identifier('scopeId'), t.stringLiteral(context.currentScope)),
              t.objectProperty(t.identifier('location'), createLocationObject(line, column)),
            ]),
          ])
        )

        traceStatements.push(traceCall)
      }

      if (traceStatements.length > 0) {
        ;(node as any).__instrumented = true
        path.insertAfter(traceStatements)
      }
    },

    // Assignment expressions: x = 5
    AssignmentExpression(path: NodePath<t.AssignmentExpression>) {
      const { node } = path
      if ((node as any).__instrumented) return
      if (!t.isIdentifier(node.left)) return

      const name = node.left.name
      const line = node.loc?.start.line || 0
      const column = node.loc?.start.column || 0

      // Wrap in sequence expression that traces after assignment
      const tracedAssignment = t.sequenceExpression([
        t.cloneNode(node),
        t.callExpression(t.identifier('__trace__'), [
          t.objectExpression([
            t.objectProperty(t.identifier('type'), t.stringLiteral('assign')),
            t.objectProperty(
              t.identifier('timestamp'),
              t.callExpression(t.memberExpression(t.identifier('Date'), t.identifier('now')), [])
            ),
            t.objectProperty(t.identifier('name'), t.stringLiteral(name)),
            t.objectProperty(t.identifier('value'), wrapValueForTrace(t.identifier(name))),
            t.objectProperty(t.identifier('scopeId'), t.stringLiteral(context.currentScope)),
            t.objectProperty(t.identifier('location'), createLocationObject(line, column)),
          ]),
        ]),
        t.identifier(name),
      ])

      ;(tracedAssignment as any).__instrumented = true
      path.replaceWith(tracedAssignment)
    },

    // Function declarations
    FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
      const { node } = path
      if ((node as any).__instrumented) return
      if (!node.id) return

      const funcName = node.id.name
      const scopeId = generateScopeId(context)
      const parentScope = context.currentScope
      const line = node.loc?.start.line || 0
      const column = node.loc?.start.column || 0

      // Trace function declaration
      const declareTrace = t.expressionStatement(
        t.callExpression(t.identifier('__trace__'), [
          t.objectExpression([
            t.objectProperty(t.identifier('type'), t.stringLiteral('declare')),
            t.objectProperty(
              t.identifier('timestamp'),
              t.callExpression(t.memberExpression(t.identifier('Date'), t.identifier('now')), [])
            ),
            t.objectProperty(t.identifier('name'), t.stringLiteral(funcName)),
            t.objectProperty(t.identifier('value'), wrapValueForTrace(t.identifier(funcName))),
            t.objectProperty(t.identifier('declarationType'), t.stringLiteral('function')),
            t.objectProperty(t.identifier('scopeId'), t.stringLiteral(parentScope)),
            t.objectProperty(t.identifier('location'), createLocationObject(line, column)),
          ]),
        ])
      )

      // Inject scope enter at function start
      const scopeEnter = createScopeEnterTrace(
        scopeId,
        parentScope,
        'function',
        funcName,
        line,
        column
      )

      // Trace parameters
      const paramTraces: t.Statement[] = node.params
        .filter((p): p is t.Identifier => t.isIdentifier(p))
        .map((param, index) => {
          return t.expressionStatement(
            t.callExpression(t.identifier('__trace__'), [
              t.objectExpression([
                t.objectProperty(t.identifier('type'), t.stringLiteral('declare')),
                t.objectProperty(
                  t.identifier('timestamp'),
                  t.callExpression(t.memberExpression(t.identifier('Date'), t.identifier('now')), [])
                ),
                t.objectProperty(t.identifier('name'), t.stringLiteral(param.name)),
                t.objectProperty(t.identifier('value'), wrapValueForTrace(t.identifier(param.name))),
                t.objectProperty(t.identifier('declarationType'), t.stringLiteral('param')),
                t.objectProperty(t.identifier('scopeId'), t.stringLiteral(scopeId)),
                t.objectProperty(t.identifier('location'), createLocationObject(line, column)),
              ]),
            ])
          )
        })

      // Insert at beginning of function body
      if (t.isBlockStatement(node.body)) {
        node.body.body.unshift(scopeEnter, ...paramTraces)
      }

      ;(node as any).__instrumented = true
      path.insertAfter(declareTrace)
    },

    // Function calls
    CallExpression(path: NodePath<t.CallExpression>) {
      const { node } = path
      if ((node as any).__instrumented) return

      // Get function name
      let funcName = 'anonymous'
      if (t.isIdentifier(node.callee)) {
        funcName = node.callee.name
      } else if (t.isMemberExpression(node.callee) && t.isIdentifier(node.callee.property)) {
        funcName = node.callee.property.name
      }

      // Skip our trace functions
      if (funcName === '__trace__' || funcName === '__serialize__') return

      const line = node.loc?.start.line || 0
      const column = node.loc?.start.column || 0
      const callId = generateCallId(context)

      // Handle console methods specially
      if (
        t.isMemberExpression(node.callee) &&
        t.isIdentifier(node.callee.object) &&
        node.callee.object.name === 'console'
      ) {
        const level = t.isIdentifier(node.callee.property) ? node.callee.property.name : 'log'

        const consoleTrace = t.callExpression(t.identifier('__trace__'), [
          t.objectExpression([
            t.objectProperty(t.identifier('type'), t.stringLiteral('console')),
            t.objectProperty(
              t.identifier('timestamp'),
              t.callExpression(t.memberExpression(t.identifier('Date'), t.identifier('now')), [])
            ),
            t.objectProperty(t.identifier('level'), t.stringLiteral(level)),
            t.objectProperty(
              t.identifier('args'),
              t.arrayExpression(node.arguments.map((arg) => wrapValueForTrace(arg as t.Expression)))
            ),
            t.objectProperty(t.identifier('location'), createLocationObject(line, column)),
          ]),
        ])

        const traced = t.sequenceExpression([consoleTrace, t.cloneNode(node)])
        ;(traced as any).__instrumented = true
        path.replaceWith(traced)
        return
      }

      // Wrap in function call trace
      const callTrace = t.callExpression(t.identifier('__trace__'), [
        t.objectExpression([
          t.objectProperty(t.identifier('type'), t.stringLiteral('function_call')),
          t.objectProperty(
            t.identifier('timestamp'),
            t.callExpression(t.memberExpression(t.identifier('Date'), t.identifier('now')), [])
          ),
          t.objectProperty(t.identifier('name'), t.stringLiteral(funcName)),
          t.objectProperty(
            t.identifier('args'),
            t.arrayExpression(node.arguments.map((arg) => wrapValueForTrace(arg as t.Expression)))
          ),
          t.objectProperty(t.identifier('callId'), t.stringLiteral(callId)),
          t.objectProperty(t.identifier('isConstructor'), t.booleanLiteral(false)),
          t.objectProperty(t.identifier('isMethod'), t.booleanLiteral(t.isMemberExpression(node.callee))),
          t.objectProperty(t.identifier('location'), createLocationObject(line, column)),
        ]),
      ])

      // Wrap result with return trace
      const resultVar = path.scope.generateUidIdentifier('result')
      const traced = t.sequenceExpression([
        callTrace,
        t.assignmentExpression('=', resultVar, t.cloneNode(node)),
        t.callExpression(t.identifier('__trace__'), [
          t.objectExpression([
            t.objectProperty(t.identifier('type'), t.stringLiteral('function_return')),
            t.objectProperty(
              t.identifier('timestamp'),
              t.callExpression(t.memberExpression(t.identifier('Date'), t.identifier('now')), [])
            ),
            t.objectProperty(t.identifier('name'), t.stringLiteral(funcName)),
            t.objectProperty(t.identifier('value'), wrapValueForTrace(resultVar)),
            t.objectProperty(t.identifier('callId'), t.stringLiteral(callId)),
            t.objectProperty(t.identifier('location'), createLocationObject(line, column)),
          ]),
        ]),
        resultVar,
      ])

      // Declare result variable in parent scope
      const parentBlock = path.findParent((p) => p.isBlockStatement() || p.isProgram())
      if (parentBlock && (parentBlock.isBlockStatement() || parentBlock.isProgram())) {
        const varDecl = t.variableDeclaration('var', [t.variableDeclarator(resultVar)])
        ;(varDecl as any).__instrumented = true
        parentBlock.node.body.unshift(varDecl)
      }

      ;(traced as any).__instrumented = true
      path.replaceWith(traced)
    },

    // Return statements
    ReturnStatement(path: NodePath<t.ReturnStatement>) {
      const { node } = path
      if ((node as any).__instrumented) return

      const line = node.loc?.start.line || 0
      const column = node.loc?.start.column || 0

      // Get enclosing function name
      const funcPath = path.getFunctionParent()
      let funcName = 'anonymous'
      if (funcPath?.node && 'id' in funcPath.node && funcPath.node.id && t.isIdentifier(funcPath.node.id)) {
        funcName = funcPath.node.id.name
      }

      // Add scope exit trace before return
      const scopeExit = createScopeExitTrace(context.currentScope, line, column)
      path.insertBefore(scopeExit)
      ;(node as any).__instrumented = true
    },
  }
}
