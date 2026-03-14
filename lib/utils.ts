import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SerializedValue } from '@/types/execution'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function serializeValue(value: unknown, depth = 0, maxDepth = 3): SerializedValue {
  if (depth > maxDepth) {
    return { type: 'object', value: '[Max depth reached]', preview: '...' }
  }

  if (value === undefined) {
    return { type: 'undefined', value: undefined, preview: 'undefined' }
  }

  if (value === null) {
    return { type: 'null', value: null, preview: 'null' }
  }

  const typeOf = typeof value

  if (typeOf === 'boolean' || typeOf === 'number' || typeOf === 'string') {
    return {
      type: 'primitive',
      value,
      preview: typeOf === 'string' ? `"${value}"` : String(value),
    }
  }

  if (typeOf === 'bigint') {
    return { type: 'bigint', value: value.toString(), preview: `${value}n` }
  }

  if (typeOf === 'symbol') {
    return { type: 'symbol', value: value.toString(), preview: value.toString() }
  }

  if (typeOf === 'function') {
    const fn = value as Function
    return {
      type: 'function',
      value: fn.toString(),
      preview: `ƒ ${fn.name || 'anonymous'}()`,
      name: fn.name,
    }
  }

  if (Array.isArray(value)) {
    const heapId = generateId()
    const properties: Record<string, SerializedValue> = {}

    value.slice(0, 10).forEach((item, index) => {
      properties[index] = serializeValue(item, depth + 1, maxDepth)
    })

    return {
      type: 'array',
      value: null,
      preview: `Array(${value.length})`,
      heapId,
      properties,
      length: value.length,
    }
  }

  if (typeOf === 'object') {
    const heapId = generateId()
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj).slice(0, 10)
    const properties: Record<string, SerializedValue> = {}

    keys.forEach((key) => {
      properties[key] = serializeValue(obj[key], depth + 1, maxDepth)
    })

    const constructor = obj.constructor?.name || 'Object'
    return {
      type: 'object',
      value: null,
      preview: constructor === 'Object' ? '{...}' : `${constructor} {...}`,
      heapId,
      properties,
    }
  }

  return { type: 'undefined', value: undefined, preview: 'unknown' }
}

export function formatValue(serialized: SerializedValue): string {
  return serialized.preview || String(serialized.value)
}

export function getValueColor(type: SerializedValue['type']): string {
  switch (type) {
    case 'primitive':
      return 'text-accent-orange'
    case 'object':
    case 'array':
      return 'text-accent-blue'
    case 'function':
      return 'text-accent-yellow'
    case 'undefined':
    case 'null':
      return 'text-gray-500'
    default:
      return 'text-white'
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
