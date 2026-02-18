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
  const { viewMode, loadRecentFiles } = useEditorStore()
  const { theme, loadSettings } = useSettingsStore()
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
      const lerp = 0.08
      currentX += (targetX - currentX) * lerp
      currentY += (targetY - currentY) * lerp
      setCursorVars(currentX, currentY)
      rafId = window.requestAnimationFrame(animate)
    }

    const handlePointerMove = (event: PointerEvent) => {
      const width = window.innerWidth || 1
      const height = window.innerHeight || 1
      targetX = Math.max(0, Math.min(100, (event.clientX / width) * 100))
      targetY = Math.max(0, Math.min(100, (event.clientY / height) * 100))
    }

    const handlePointerLeave = () => {
      targetX = 50
      targetY = 50
    }

    setCursorVars(50, 50)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerleave', handlePointerLeave)
    rafId = window.requestAnimationFrame(animate)

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

    document.documentElement.classList.toggle('dark', theme === 'dark')
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    }

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
  }, [theme, loadSettings, loadRecentFiles])

  return (
    <div className="app-shell relative h-screen overflow-hidden">
      <div className="liquid-bg" aria-hidden />
      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        <TitleBar />
        <div className="flex flex-1 overflow-hidden relative">
          <OutlineSidebar />
          <main className="flex-1 overflow-auto custom-scrollbar">
            {viewMode === 'wysiwyg' ? <WysiwygEditor /> : <RawEditor />}
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
