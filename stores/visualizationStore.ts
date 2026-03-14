import { create } from 'zustand'
import {
  DEFAULT_VISUALIZATION_SETTINGS,
  type VisualizationSettings,
  type VisualizationMode,
} from '@/types/visualization'

interface VisualizationState extends VisualizationSettings {
  selectedNodeId: string | null
  hoveredNodeId: string | null
  zoomLevel: number
  panPosition: { x: number; y: number }

  setMode: (mode: VisualizationMode) => void
  toggleScopeChain: () => void
  toggleClosures: () => void
  toggleHeapReferences: () => void
  setAnimationSpeed: (speed: number) => void
  toggleAutoAdvance: () => void
  toggleHighlightChanges: () => void
  setSelectedNode: (id: string | null) => void
  setHoveredNode: (id: string | null) => void
  setZoom: (level: number) => void
  setPan: (position: { x: number; y: number }) => void
  resetView: () => void
}

export const useVisualizationStore = create<VisualizationState>((set) => ({
  ...DEFAULT_VISUALIZATION_SETTINGS,
  selectedNodeId: null,
  hoveredNodeId: null,
  zoomLevel: 1,
  panPosition: { x: 0, y: 0 },

  setMode: (mode) => set({ mode }),
  toggleScopeChain: () => set((state) => ({ showScopeChain: !state.showScopeChain })),
  toggleClosures: () => set((state) => ({ showClosures: !state.showClosures })),
  toggleHeapReferences: () => set((state) => ({ showHeapReferences: !state.showHeapReferences })),
  setAnimationSpeed: (speed) => set({ animationSpeed: Math.max(0.5, Math.min(2, speed)) }),
  toggleAutoAdvance: () => set((state) => ({ autoAdvance: !state.autoAdvance })),
  toggleHighlightChanges: () => set((state) => ({ highlightChanges: !state.highlightChanges })),
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  setZoom: (level) => set({ zoomLevel: Math.max(0.25, Math.min(2, level)) }),
  setPan: (position) => set({ panPosition: position }),
  resetView: () => set({ zoomLevel: 1, panPosition: { x: 0, y: 0 } }),
}))
