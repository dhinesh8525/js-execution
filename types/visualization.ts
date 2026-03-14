// Custom node/edge types (no external dependency)
export interface Node<T = Record<string, unknown>> {
  id: string
  type?: string
  position: { x: number; y: number }
  data: T
}

export interface Edge<T = Record<string, unknown>> {
  id: string
  source: string
  target: string
  data?: T
}

export type VisualizationMode = 'full' | 'stack-only' | 'memory-only' | 'event-loop'

export interface VisualizationSettings {
  mode: VisualizationMode
  showScopeChain: boolean
  showClosures: boolean
  showHeapReferences: boolean
  animationSpeed: number // 0.5 - 2.0
  autoAdvance: boolean
  highlightChanges: boolean
}

export const DEFAULT_VISUALIZATION_SETTINGS: VisualizationSettings = {
  mode: 'full',
  showScopeChain: true,
  showClosures: true,
  showHeapReferences: true,
  animationSpeed: 1.0,
  autoAdvance: false,
  highlightChanges: true,
}

// React Flow node types
export type StackFrameNode = Node<{
  name: string
  line: number
  variables: Array<{ name: string; value: string; type: string }>
  isActive: boolean
  isAsync: boolean
}>

export type HeapObjectNode = Node<{
  type: string
  preview: string
  properties: Array<{ key: string; value: string; isReference: boolean }>
  isHighlighted: boolean
}>

export type ScopeNode = Node<{
  name: string
  type: string
  variables: Array<{ name: string; value: string; type: string }>
  isActive: boolean
}>

export type EventLoopNode = Node<{
  phase: string
  items: Array<{ id: string; label: string; type: string }>
}>

export type VisualizationNode = StackFrameNode | HeapObjectNode | ScopeNode | EventLoopNode

export type ReferenceEdge = Edge<{
  label?: string
  isHighlighted?: boolean
}>

// Layout configuration
export interface LayoutConfig {
  stackX: number
  heapX: number
  scopeX: number
  eventLoopX: number
  nodeWidth: number
  nodeHeight: number
  verticalGap: number
  horizontalGap: number
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  stackX: 50,
  heapX: 350,
  scopeX: 650,
  eventLoopX: 50,
  nodeWidth: 250,
  nodeHeight: 150,
  verticalGap: 20,
  horizontalGap: 50,
}

// Animation types
export interface AnimationConfig {
  duration: number
  stiffness: number
  damping: number
  mass: number
}

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  duration: 0.3,
  stiffness: 300,
  damping: 30,
  mass: 1,
}
