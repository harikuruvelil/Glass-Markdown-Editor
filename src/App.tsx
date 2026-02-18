import { useEffect, useState } from 'react'
import { useEditorStore } from './stores/editorStore'
import { useSettingsStore } from './stores/settingsStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useAutoSave } from './hooks/useAutoSave'
import { setupDragAndDrop } from './utils/fileHandling'
import TitleBar from './components/TitleBar'
import StatusBar from './components/StatusBar'
import WysiwygEditor from './components/Editor/WysiwygEditor'
import RawEditor from './components/Editor/RawEditor'
import OutlineSidebar from './components/Sidebar/OutlineSidebar'
import FindReplace from './components/FindReplace'
import Settings from './components/Settings'
import UnsavedChangesDialog from './components/UnsavedChangesDialog'

function App() {
  const viewMode = useEditorStore((state) => state.viewMode)
  const loadRecentFiles = useEditorStore((state) => state.loadRecentFiles)
  const theme = useSettingsStore((state) => state.theme)
  const loadSettings = useSettingsStore((state) => state.loadSettings)
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useKeyboardShortcuts()
  useAutoSave()

  useEffect(() => {
    const openStartupFile = async () => {
      const { takeStartupFile } = useEditorStore.getState()
      await takeStartupFile()
    }

    void openStartupFile()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    let rafId: number | null = null
    let targetX = 50
    let targetY = 50
    let currentX = 50
    let currentY = 50

    const setCursorVars = (x: number, y: number) => {
      root.style.setProperty('--cursor-x', `${x.toFixed(2)}%`)
      root.style.setProperty('--cursor-y', `${y.toFixed(2)}%`)
    }

    const animate = () => {
      const lerp = 0.14
      currentX += (targetX - currentX) * lerp
      currentY += (targetY - currentY) * lerp
      setCursorVars(currentX, currentY)

      const dx = Math.abs(targetX - currentX)
      const dy = Math.abs(targetY - currentY)
      if (dx < 0.08 && dy < 0.08) {
        currentX = targetX
        currentY = targetY
        setCursorVars(currentX, currentY)
        rafId = null
        return
      }

      rafId = window.requestAnimationFrame(animate)
    }

    const ensureAnimation = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(animate)
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      const width = window.innerWidth || 1
      const height = window.innerHeight || 1
      targetX = Math.max(0, Math.min(100, (event.clientX / width) * 100))
      targetY = Math.max(0, Math.min(100, (event.clientY / height) * 100))
      ensureAnimation()
    }

    const handlePointerLeave = () => {
      targetX = 50
      targetY = 50
      ensureAnimation()
    }

    setCursorVars(50, 50)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [])

  useEffect(() => {
    loadSettings()
    loadRecentFiles()
  }, [loadSettings, loadRecentFiles])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    }
  }, [theme])

  useEffect(() => {
    const cleanup = setupDragAndDrop()
    const handleOpenSettings = () => setIsSettingsOpen(true)
    const handleOpenFind = () => setIsFindReplaceOpen(true)
    const handleOpenFindReplace = () => setIsFindReplaceOpen(true)

    window.addEventListener('open-settings', handleOpenSettings)
    window.addEventListener('open-find', handleOpenFind)
    window.addEventListener('open-find-replace', handleOpenFindReplace)

    return () => {
      cleanup()
      window.removeEventListener('open-settings', handleOpenSettings)
      window.removeEventListener('open-find', handleOpenFind)
      window.removeEventListener('open-find-replace', handleOpenFindReplace)
    }
  }, [])

  return (
    <div className="app-shell relative h-screen overflow-hidden">
      <div className="liquid-bg" aria-hidden />
      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        <TitleBar />
        <div className="flex flex-1 overflow-hidden relative">
          <OutlineSidebar />
          <main className="flex-1 overflow-auto custom-scrollbar">
            <div key={viewMode} className="editor-mode-transition h-full">
              {viewMode === 'wysiwyg' ? <WysiwygEditor /> : <RawEditor />}
            </div>
          </main>
        </div>
        <StatusBar />
        <FindReplace isOpen={isFindReplaceOpen} onClose={() => setIsFindReplaceOpen(false)} />
        <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <UnsavedChangesDialog />
      </div>
    </div>
  )
}

export default App
