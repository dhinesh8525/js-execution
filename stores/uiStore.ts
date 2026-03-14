import { create } from 'zustand'

interface PanelSizes {
  editor: number
  visualization: number
  console: number
}

interface UiState {
  panelSizes: PanelSizes
  showConsole: boolean
  consoleHeight: number
  theme: 'dark' | 'light'
  isShareModalOpen: boolean
  isSettingsModalOpen: boolean
  isHelpModalOpen: boolean

  setPanelSizes: (sizes: Partial<PanelSizes>) => void
  toggleConsole: () => void
  setConsoleHeight: (height: number) => void
  setTheme: (theme: 'dark' | 'light') => void
  openShareModal: () => void
  closeShareModal: () => void
  openSettingsModal: () => void
  closeSettingsModal: () => void
  openHelpModal: () => void
  closeHelpModal: () => void
}

export const useUiStore = create<UiState>((set) => ({
  panelSizes: {
    editor: 40,
    visualization: 60,
    console: 25,
  },
  showConsole: true,
  consoleHeight: 200,
  theme: 'dark',
  isShareModalOpen: false,
  isSettingsModalOpen: false,
  isHelpModalOpen: false,

  setPanelSizes: (sizes) =>
    set((state) => ({
      panelSizes: { ...state.panelSizes, ...sizes },
    })),

  toggleConsole: () => set((state) => ({ showConsole: !state.showConsole })),
  setConsoleHeight: (height) => set({ consoleHeight: Math.max(100, Math.min(400, height)) }),
  setTheme: (theme) => set({ theme }),
  openShareModal: () => set({ isShareModalOpen: true }),
  closeShareModal: () => set({ isShareModalOpen: false }),
  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),
  openHelpModal: () => set({ isHelpModalOpen: true }),
  closeHelpModal: () => set({ isHelpModalOpen: false }),
}))
