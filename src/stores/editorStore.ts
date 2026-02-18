import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api/core'

export type ViewMode = 'wysiwyg' | 'raw'

interface EditorState {
  currentFilePath: string | null
  content: string
  viewMode: ViewMode
  hasUnsavedChanges: boolean
  recentFiles: string[]
  wordCount: number
  lineCount: number
  characterCount: number
  
  // Actions
  setContent: (content: string) => void
  setCurrentFile: (path: string | null) => void
  setViewMode: (mode: ViewMode) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  openFile: () => Promise<boolean>
  openFilePath: (path: string) => Promise<boolean>
  takeStartupFile: () => Promise<boolean>
  saveFile: () => Promise<boolean>
  saveFileAs: () => Promise<boolean>
  newFile: () => void
  loadRecentFiles: () => Promise<void>
  updateStats: (content: string) => void
}

function computeDocumentStats(content: string) {
  let lines = 1
  let words = 0
  let inWord = false

  for (let i = 0; i < content.length; i += 1) {
    const code = content.charCodeAt(i)
    if (code === 10) {
      lines += 1
    }

    const isWhitespace =
      code === 32 || code === 9 || code === 10 || code === 13 || code === 12 || code === 11

    if (isWhitespace) {
      if (inWord) {
        words += 1
        inWord = false
      }
    } else {
      inWord = true
    }
  }

  if (inWord) {
    words += 1
  }

  return {
    wordCount: words,
    lineCount: lines,
    characterCount: content.length,
  }
}

function requestEditorSyncIfNeeded(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    let settled = false
    const timeout = window.setTimeout(() => {
      if (settled) return
      settled = true
      resolve()
    }, 180)

    window.dispatchEvent(
      new CustomEvent('editor-sync-request', {
        detail: {
          done: () => {
            if (settled) return
            settled = true
            window.clearTimeout(timeout)
            resolve()
          },
        },
      })
    )
  })
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => {
      let pendingStatsTimer: ReturnType<typeof setTimeout> | null = null

      const scheduleStatsUpdate = (content: string) => {
        if (pendingStatsTimer) {
          clearTimeout(pendingStatsTimer)
        }
        pendingStatsTimer = setTimeout(() => {
          pendingStatsTimer = null
          get().updateStats(content)
        }, 120)
      }

      return ({
      currentFilePath: null,
      content: '',
      viewMode: 'wysiwyg',
      hasUnsavedChanges: false,
      recentFiles: [],
      wordCount: 0,
      lineCount: 0,
      characterCount: 0,

      setContent: (content: string) => {
        if (get().content === content) {
          return
        }
        set({ content, hasUnsavedChanges: true })
        scheduleStatsUpdate(content)
      },

      setCurrentFile: (path: string | null) => {
        set({ currentFilePath: path })
      },

      setViewMode: (mode: ViewMode) => {
        if (get().viewMode === mode) {
          return
        }
        set({ viewMode: mode })
      },

      setHasUnsavedChanges: (hasChanges: boolean) => {
        if (get().hasUnsavedChanges === hasChanges) {
          return
        }
        set({ hasUnsavedChanges: hasChanges })
      },

      openFile: async () => {
        try {
          const result = await invoke<{ path: string; content: string } | null>('open_file')
          if (!result) {
            return false
          }
          set({
            currentFilePath: result.path,
            content: result.content,
            hasUnsavedChanges: false,
          })
          get().updateStats(result.content)
          await get().loadRecentFiles()
          return true
        } catch (error) {
          console.error('Failed to open file:', error)
          return false
        }
      },

      openFilePath: async (path: string) => {
        try {
          const result = await invoke<{ path: string; content: string }>('open_file_path', { path })
          set({
            currentFilePath: result.path,
            content: result.content,
            hasUnsavedChanges: false,
          })
          get().updateStats(result.content)
          await get().loadRecentFiles()
          return true
        } catch (error) {
          console.error('Failed to open file path:', error)
          return false
        }
      },

      takeStartupFile: async () => {
        try {
          const result = await invoke<{ path: string; content: string } | null>('take_startup_file')
          if (!result) {
            return false
          }
          set({
            currentFilePath: result.path,
            content: result.content,
            hasUnsavedChanges: false,
          })
          get().updateStats(result.content)
          await get().loadRecentFiles()
          return true
        } catch (error) {
          console.error('Failed to open startup file:', error)
          return false
        }
      },

      saveFile: async () => {
        await requestEditorSyncIfNeeded()
        const { currentFilePath, content } = get()
        if (!currentFilePath) {
          return get().saveFileAs()
        }

        try {
          await invoke('save_file', { path: currentFilePath, content })
          set({ hasUnsavedChanges: false })
          return true
        } catch (error) {
          console.error('Failed to save file:', error)
          return false
        }
      },

      saveFileAs: async () => {
        try {
          await requestEditorSyncIfNeeded()
          const { content } = get()
          const result = await invoke<string | null>('save_file_as', { content })
          if (!result) {
            return false
          }
          set({
            currentFilePath: result,
            hasUnsavedChanges: false,
          })
          await get().loadRecentFiles()
          return true
        } catch (error) {
          console.error('Failed to save file as:', error)
          return false
        }
      },

      newFile: () => {
        set({
          currentFilePath: null,
          content: '',
          hasUnsavedChanges: false,
        })
        get().updateStats('')
      },

      loadRecentFiles: async () => {
        try {
          const files = await invoke<string[]>('get_recent_files')
          set({ recentFiles: files })
        } catch (error) {
          console.error('Failed to load recent files:', error)
        }
      },

      updateStats: (content: string) => {
        const stats = computeDocumentStats(content)

        set((state) => {
          if (
            state.wordCount === stats.wordCount &&
            state.lineCount === stats.lineCount &&
            state.characterCount === stats.characterCount
          ) {
            return state
          }
          return {
            wordCount: stats.wordCount,
            lineCount: stats.lineCount,
            characterCount: stats.characterCount,
          }
        })
      },
    })},
    {
      name: 'editor-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        recentFiles: state.recentFiles,
      }),
    }
  )
)
