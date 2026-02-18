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

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      currentFilePath: null,
      content: '',
      viewMode: 'wysiwyg',
      hasUnsavedChanges: false,
      recentFiles: [],
      wordCount: 0,
      lineCount: 0,
      characterCount: 0,

      setContent: (content: string) => {
        set({ content, hasUnsavedChanges: true })
        get().updateStats(content)
      },

      setCurrentFile: (path: string | null) => {
        set({ currentFilePath: path })
      },

      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode })
      },

      setHasUnsavedChanges: (hasChanges: boolean) => {
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
        const lines = content.split('\n').length
        const characters = content.length
        const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length
        
        set({
          wordCount: words,
          lineCount: lines,
          characterCount: characters,
        })
      },
    }),
    {
      name: 'editor-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        recentFiles: state.recentFiles,
      }),
    }
  )
)
