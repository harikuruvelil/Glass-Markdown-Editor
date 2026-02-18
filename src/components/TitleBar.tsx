import { useEditorStore } from '../stores/editorStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useDialogStore } from '../stores/dialogStore'
import { handleFileOpen, handleFileSave, handleFileSaveAs, handleNewFile } from '../utils/fileHandling'
import { invoke } from '@tauri-apps/api/core'

/* ── SVG Icons (line-style, consistent 1.5px stroke) ── */
const IconNew = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
  </svg>
)
const IconOpen = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2Z" />
  </svg>
)
const IconSave = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
)
const IconSaveAs = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <polyline points="17 21 17 13 7 13 7 21" /><line x1="12" y1="17" x2="12" y2="15" /><line x1="11" y1="16" x2="13" y2="16" />
  </svg>
)
const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
)
const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)
const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
)
const IconMonitor = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)
const IconCode = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
)
const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" />
  </svg>
)

export default function TitleBar() {
  const currentFilePath = useEditorStore((state) => state.currentFilePath)
  const hasUnsavedChanges = useEditorStore((state) => state.hasUnsavedChanges)
  const viewMode = useEditorStore((state) => state.viewMode)
  const setViewMode = useEditorStore((state) => state.setViewMode)
  const theme = useSettingsStore((state) => state.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)

  const fileName = currentFilePath ? currentFilePath.split(/[/\\]/).pop() || 'Untitled' : 'Untitled'

  const handleMinimize = async () => {
    try {
      await invoke('window_minimize')
    } catch (error) {
      console.error('Minimize failed:', error)
    }
  }

  const handleMaximize = async () => {
    try {
      await invoke('window_toggle_maximize')
    } catch (error) {
      console.error('Toggle maximize failed:', error)
    }
  }

  const handleStartDrag = async (e: React.MouseEvent<HTMLElement>) => {
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest('button, input, textarea, select, a, [role="button"]')) {
      return
    }
    try {
      await invoke('window_start_dragging')
    } catch (error) {
      console.error('Window dragging failed:', error)
    }
  }

  const handleClose = async () => {
    const { hasUnsavedChanges, saveFile } = useEditorStore.getState()
    if (hasUnsavedChanges) {
      const decision = await useDialogStore.getState().requestUnsavedDecision('close this window')
      if (decision === 'cancel') {
        return
      }

      if (decision === 'save') {
        const didSave = await saveFile()
        if (!didSave || useEditorStore.getState().hasUnsavedChanges) {
          return
        }
      }
    }
    try {
      await invoke('window_close')
    } catch (error) {
      console.error('Close failed:', error)
    }
  }

  const themeIcon = theme === 'light' ? <IconMoon /> : theme === 'dark' ? <IconMonitor /> : <IconSun />
  const themeLabel = theme === 'light' ? 'Dark' : theme === 'dark' ? 'System' : 'Light'

  return (
    <header
      onMouseDown={handleStartDrag}
      className="glass-strong flex items-center h-12 px-3 select-none shrink-0 relative z-30"
    >
      {/* Left: logo + file actions */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Logo */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--gradient-blue)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v16H4z" /><path d="M7 15V9l3 3 3-3v6" /><line x1="17" y1="9" x2="17" y2="15" />
          </svg>
        </div>

        <div className="flex items-center gap-0.5 ml-1">
          <button onClick={handleNewFile} className="btn-glass !px-2.5 !py-1.5 !text-xs !gap-1" title="New (Ctrl+N)">
            <IconNew /> <span className="hidden sm:inline">New</span>
          </button>
          <button onClick={handleFileOpen} className="btn-glass !px-2.5 !py-1.5 !text-xs !gap-1" title="Open (Ctrl+O)">
            <IconOpen /> <span className="hidden sm:inline">Open</span>
          </button>
          <button onClick={handleFileSave} className="btn-glass !px-2.5 !py-1.5 !text-xs !gap-1" title="Save (Ctrl+S)">
            <IconSave /> <span className="hidden sm:inline">Save</span>
          </button>
          <button onClick={handleFileSaveAs} className="btn-glass !px-2.5 !py-1.5 !text-xs !gap-1" title="Save As (Ctrl+Shift+S)">
            <IconSaveAs /> <span className="hidden lg:inline">Save As</span>
          </button>
        </div>
      </div>

      {/* Center: filename */}
      <div className="flex items-center justify-center gap-1.5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <span className="text-[13px] font-medium truncate max-w-[280px]" style={{ color: 'var(--text-primary)' }}>
          {fileName}
        </span>
        {hasUnsavedChanges && (
          <span
            className="w-2 h-2 rounded-full shrink-0 animate-pulse-subtle"
            style={{ background: 'var(--gradient-blue)' }}
          />
        )}
      </div>

      {/* Right: toggles + window controls */}
      <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
        <button
          onClick={() => setViewMode(viewMode === 'wysiwyg' ? 'raw' : 'wysiwyg')}
          className="btn-glass view-mode-toggle !px-2.5 !py-1.5 !text-xs !gap-1"
          data-mode={viewMode}
          title="Toggle View (Ctrl+Shift+M)"
        >
          <span className="view-mode-icon">{viewMode === 'wysiwyg' ? <IconCode /> : <IconEye />}</span>
          <span className="hidden sm:inline view-mode-label">{viewMode === 'wysiwyg' ? 'Raw' : 'Full Text'}</span>
        </button>

        <button
          onClick={() => {
            const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
            setTheme(next)
          }}
          className="btn-glass !px-2 !py-1.5 !text-xs"
          title={`Switch to ${themeLabel} theme`}
        >
          {themeIcon}
        </button>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
          className="btn-glass !px-2 !py-1.5 !text-xs"
          title="Settings"
        >
          <IconSettings />
        </button>

        {/* Spacer */}
        <div className="w-px h-5 mx-1" style={{ background: 'var(--canvas-border)' }} />

        {/* macOS-style traffic lights */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleMinimize}
            className="group w-[13px] h-[13px] rounded-full transition-glass flex items-center justify-center"
            style={{
              background: 'rgba(254, 188, 46, 0.28)',
              border: '1px solid rgba(254, 188, 46, 0.82)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), 0 1px 4px rgba(0,0,0,0.25)',
            }}
            title="Minimize"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-glass" style={{ background: '#FEBC2E', borderRadius: '9999px', width: '13px', height: '13px', display: 'block', boxShadow: '0 0 8px rgba(254, 188, 46, 0.6)' }} />
          </button>
          <button
            onClick={handleMaximize}
            className="group w-[13px] h-[13px] rounded-full transition-glass flex items-center justify-center"
            style={{
              background: 'rgba(40, 200, 64, 0.26)',
              border: '1px solid rgba(40, 200, 64, 0.82)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), 0 1px 4px rgba(0,0,0,0.25)',
            }}
            title="Maximize"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-glass" style={{ background: '#28C840', borderRadius: '9999px', width: '13px', height: '13px', display: 'block', boxShadow: '0 0 8px rgba(40, 200, 64, 0.55)' }} />
          </button>
          <button
            onClick={handleClose}
            className="group w-[13px] h-[13px] rounded-full transition-glass flex items-center justify-center"
            style={{
              background: 'rgba(255, 95, 87, 0.28)',
              border: '1px solid rgba(255, 95, 87, 0.86)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), 0 1px 4px rgba(0,0,0,0.25)',
            }}
            title="Close"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-glass" style={{ background: '#FF5F57', borderRadius: '9999px', width: '13px', height: '13px', display: 'block', boxShadow: '0 0 8px rgba(255, 95, 87, 0.6)' }} />
          </button>
        </div>
      </div>
    </header>
  )
}
