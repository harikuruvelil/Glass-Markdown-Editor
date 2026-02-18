import { useEffect, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useSettingsStore } from '../stores/settingsStore'

export function useAutoSave() {
  const hasUnsavedChanges = useEditorStore((state) => state.hasUnsavedChanges)
  const currentFilePath = useEditorStore((state) => state.currentFilePath)
  const saveFile = useEditorStore((state) => state.saveFile)
  const autoSave = useSettingsStore((state) => state.autoSave)
  const autoSaveInterval = useSettingsStore((state) => state.autoSaveInterval)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (autoSave && hasUnsavedChanges && currentFilePath) {
      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Set up new interval
      intervalRef.current = setInterval(() => {
        if (hasUnsavedChanges && currentFilePath) {
          saveFile()
        }
      }, autoSaveInterval * 1000)
    } else {
      // Clear interval if auto-save is disabled or no unsaved changes
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoSave, autoSaveInterval, hasUnsavedChanges, currentFilePath, saveFile])
}
