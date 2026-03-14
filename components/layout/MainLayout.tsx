'use client'

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useUiStore } from '@/stores/uiStore'

interface MainLayoutProps {
  editor: React.ReactNode
  visualization: React.ReactNode
  console: React.ReactNode
  toolbar: React.ReactNode
  controls: React.ReactNode
}

export function MainLayout({
  editor,
  visualization,
  console: consolePanel,
  toolbar,
  controls,
}: MainLayoutProps) {
  const { panelSizes, setPanelSizes, showConsole, consoleHeight } = useUiStore()

  return (
    <div className="h-screen flex flex-col bg-editor-bg">
      {/* Top toolbar */}
      <header className="flex-shrink-0 border-b border-panel-border">
        {toolbar}
      </header>

      {/* Main content */}
      <main className="flex-1 min-h-0">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Editor panel */}
          <Panel
            defaultSize={panelSizes.editor}
            minSize={20}
            onResize={(size) => setPanelSizes({ editor: size })}
          >
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">{editor}</div>
              {showConsole && (
                <div style={{ height: consoleHeight }} className="flex-shrink-0">
                  {consolePanel}
                </div>
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-panel-border hover:bg-accent-blue transition-colors cursor-col-resize" />

          {/* Visualization panel */}
          <Panel
            defaultSize={panelSizes.visualization}
            minSize={30}
            onResize={(size) => setPanelSizes({ visualization: size })}
          >
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0 overflow-auto">{visualization}</div>
            </div>
          </Panel>
        </PanelGroup>
      </main>

      {/* Bottom controls */}
      <footer className="flex-shrink-0 border-t border-panel-border bg-panel-bg">
        {controls}
      </footer>
    </div>
  )
}
