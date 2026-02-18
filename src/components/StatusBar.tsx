import { useEditorStore } from '../stores/editorStore'
import { useSettingsStore } from '../stores/settingsStore'

export default function StatusBar() {
  const wordCount = useEditorStore((state) => state.wordCount)
  const lineCount = useEditorStore((state) => state.lineCount)
  const characterCount = useEditorStore((state) => state.characterCount)
  const viewMode = useEditorStore((state) => state.viewMode)
  const wordWrap = useSettingsStore((state) => state.wordWrap)

  return (
    <footer className="glass-subtle border-gradient-top shrink-0 flex items-center justify-between px-4 h-7 text-[11px] tracking-wide z-20">
      {/* Left: document stats */}
      <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>
          </svg>
          {wordCount.toLocaleString()} words
        </span>
        <span>{lineCount.toLocaleString()} lines</span>
        <span>{characterCount.toLocaleString()} chars</span>
      </div>

      {/* Right: metadata */}
      <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
        <span className="uppercase tracking-widest text-[10px]">UTF-8</span>
        <span>{wordWrap ? 'Wrap' : 'No Wrap'}</span>
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium"
          style={{
            background: viewMode === 'wysiwyg'
              ? 'rgba(108, 180, 238, 0.1)'
              : 'rgba(184, 169, 232, 0.1)',
            color: viewMode === 'wysiwyg' ? '#4A90D9' : '#9B8AD4',
          }}
        >
          {viewMode === 'wysiwyg' ? 'FULL TEXT' : 'RAW'}
        </span>
      </div>
    </footer>
  )
}
