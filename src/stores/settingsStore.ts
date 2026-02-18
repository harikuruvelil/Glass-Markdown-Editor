import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface SettingsState {
  theme: Theme
  fontFamily: string
  fontSize: number
  codeFontFamily: string
  autoSave: boolean
  autoSaveInterval: number
  defaultView: 'wysiwyg' | 'raw'
  spellCheck: boolean
  wordWrap: boolean
  
  // Actions
  setTheme: (theme: Theme) => void
  setFontFamily: (font: string) => void
  setFontSize: (size: number) => void
  setCodeFontFamily: (font: string) => void
  setAutoSave: (enabled: boolean) => void
  setAutoSaveInterval: (interval: number) => void
  setDefaultView: (view: 'wysiwyg' | 'raw') => void
  setSpellCheck: (enabled: boolean) => void
  setWordWrap: (enabled: boolean) => void
  loadSettings: () => void
}

const defaultSettings = {
  theme: 'system' as Theme,
  fontFamily: 'Segoe UI Variable',
  fontSize: 16,
  codeFontFamily: 'Cascadia Code',
  autoSave: true,
  autoSaveInterval: 30,
  defaultView: 'wysiwyg' as const,
  spellCheck: true,
  wordWrap: true,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setTheme: (theme: Theme) => {
        set({ theme })
        // Apply theme immediately
        document.documentElement.classList.toggle('dark', theme === 'dark')
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          document.documentElement.classList.toggle('dark', prefersDark)
        }
      },

      setFontFamily: (font: string) => {
        set({ fontFamily: font })
      },

      setFontSize: (size: number) => {
        set({ fontSize: size })
      },

      setCodeFontFamily: (font: string) => {
        set({ codeFontFamily: font })
      },

      setAutoSave: (enabled: boolean) => {
        set({ autoSave: enabled })
      },

      setAutoSaveInterval: (interval: number) => {
        set({ autoSaveInterval: interval })
      },

      setDefaultView: (view: 'wysiwyg' | 'raw') => {
        set({ defaultView: view })
      },

      setSpellCheck: (enabled: boolean) => {
        set({ spellCheck: enabled })
      },

      setWordWrap: (enabled: boolean) => {
        set({ wordWrap: enabled })
      },

      loadSettings: () => {
        // Settings are automatically loaded from persistence
        const { theme } = get()
        document.documentElement.classList.toggle('dark', theme === 'dark')
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          document.documentElement.classList.toggle('dark', prefersDark)
        }
      },
    }),
    {
      name: 'settings-storage',
    }
  )
)
