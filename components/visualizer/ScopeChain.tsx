'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Scope, Variable } from '@/types/execution'
import { formatValue, getValueColor } from '@/lib/utils'

interface ScopeChainProps {
  scopes: Map<string, Scope>
  activeScopeId?: string
}

export function ScopeChain({ scopes, activeScopeId }: ScopeChainProps) {
  // Build scope chain from active scope to global
  const buildChain = (): Scope[] => {
    const chain: Scope[] = []
    let currentId = activeScopeId

    while (currentId) {
      const scope = scopes.get(currentId)
      if (scope) {
        chain.push(scope)
        currentId = scope.parentId || undefined
      } else {
        break
      }
    }

    return chain
  }

  const chain = buildChain()

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header flex items-center justify-between">
        <span>Scope Chain</span>
        <span className="text-xs text-gray-500">{chain.length} scopes</span>
      </div>

      <div className="panel-content flex-1 overflow-auto">
        {chain.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No active scopes
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2">
              {chain.map((scope, index) => (
                <motion.div
                  key={scope.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    delay: index * 0.05,
                  }}
                >
                  <ScopeBlock
                    scope={scope}
                    isActive={index === 0}
                    depth={index}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

interface ScopeBlockProps {
  scope: Scope
  isActive: boolean
  depth: number
}

function ScopeBlock({ scope, isActive, depth }: ScopeBlockProps) {
  const variables = Array.from(scope.variables.values())

  const getScopeIcon = () => {
    switch (scope.type) {
      case 'global':
        return '🌍'
      case 'function':
        return 'ƒ'
      case 'block':
        return '{}'
      default:
        return '?'
    }
  }

  const getScopeColor = () => {
    switch (scope.type) {
      case 'global':
        return 'border-blue-600'
      case 'function':
        return 'border-yellow-600'
      case 'block':
        return 'border-gray-600'
      default:
        return 'border-gray-600'
    }
  }

  return (
    <div
      className={`scope-block border-l-4 ${getScopeColor()} ${
        isActive ? 'ring-2 ring-accent-blue ring-offset-1 ring-offset-editor-bg' : ''
      }`}
      style={{ marginLeft: `${depth * 12}px` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{getScopeIcon()}</span>
          <span className="font-medium text-sm">{scope.name || scope.type}</span>
        </div>
        <span className="text-xs text-gray-500 capitalize">{scope.type}</span>
      </div>

      {variables.length === 0 ? (
        <div className="text-xs text-gray-500">No variables</div>
      ) : (
        <div className="space-y-1">
          {variables.map((variable) => (
            <VariableRow key={variable.name} variable={variable} />
          ))}
        </div>
      )}
    </div>
  )
}

interface VariableRowProps {
  variable: Variable
}

function VariableRow({ variable }: VariableRowProps) {
  const colorClass = getValueColor(variable.value.type)

  const getDeclarationBadge = () => {
    switch (variable.declarationType) {
      case 'const':
        return 'variable-badge variable-badge-const'
      case 'let':
        return 'variable-badge variable-badge-let'
      case 'var':
        return 'variable-badge variable-badge-var'
      case 'function':
        return 'variable-badge bg-yellow-900/50 text-yellow-300'
      case 'param':
        return 'variable-badge bg-green-900/50 text-green-300'
      default:
        return 'variable-badge bg-gray-700 text-gray-300'
    }
  }

  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <span className={getDeclarationBadge()}>{variable.declarationType}</span>
        <span className="font-mono text-white">{variable.name}</span>
      </div>
      <span className={`font-mono ${colorClass}`}>
        {formatValue(variable.value)}
      </span>
    </div>
  )
}
