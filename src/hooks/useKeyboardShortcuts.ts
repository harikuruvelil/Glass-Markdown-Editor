import { useEffect } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useSettingsStore } from '../stores/settingsStore'
import { handleFileOpen, handleFileSave, handleFileSaveAs, handleNewFile } from '../utils/fileHandling'

export function useKeyboardShortcuts() {
  const setViewMode = useEditorStore((state) => state.setViewMode)
  const setWordWrap = useSettingsStore((state) => state.setWordWrap)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      // Ctrl/Cmd combinations
      if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd + Shift combinations
        if (e.shiftKey) {
          switch (key) {
            case 's':
              e.preventDefault()
              handleFileSaveAs()
              return
            case 'm':
              e.preventDefault()
              const viewMode = useEditorStore.getState().viewMode
              setViewMode(viewMode === 'wysiwyg' ? 'raw' : 'wysiwyg')
              return
            case 'o':
              e.preventDefault()
              // Toggle outline sidebar
              return
            case 'k':
              e.preventDefault()
              // Inline code - handled by TipTap
              return
          }
        }

        switch (key) {
          case 'n':
            e.preventDefault()
            handleNewFile()
            break
          case 'o':
            e.preventDefault()
            handleFileOpen()
            break
          case 's':
            e.preventDefault()
            if (e.shiftKey) {
              handleFileSaveAs()
            } else {
              handleFileSave()
            }
            break
          case 'p':
            e.preventDefault()
            window.print()
            break
          case 'z':
            e.preventDefault()
            // Undo - would need to be implemented in editor
            break
          case 'y':
            e.preventDefault()
            // Redo - would need to be implemented in editor
            break
          case 'b':
            e.preventDefault()
            // Bold - handled by TipTap
            break
          case 'i':
            e.preventDefault()
            // Italic - handled by TipTap
            break
          case 'k':
            e.preventDefault()
            // Link - handled by TipTap
            break
          case 'f':
            e.preventDefault()
            // Find - open Find dialog
            window.dispatchEvent(new CustomEvent('open-find'))
            break
          case 'h':
            e.preventDefault()
            // Find & Replace - open Find/Replace dialog
            window.dispatchEvent(new CustomEvent('open-find-replace'))
            break
          case '=':
          case '+':
            e.preventDefault()
            // Zoom in
            break
          case '-':
            e.preventDefault()
            // Zoom out
            break
          case '0':
            e.preventDefault()
            // Reset zoom
            break
        }
      }

      // F5 for word wrap toggle
      if (e.key === 'F5') {
        e.preventDefault()
        const wordWrap = useSettingsStore.getState().wordWrap
        setWordWrap(!wordWrap)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [setViewMode, setWordWrap])
}
