import { useState, useEffect, useRef } from 'react'
import { useEditorStore } from '../stores/editorStore'

interface FindReplaceProps {
  isOpen: boolean
  onClose: () => void
}

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const IconReplace = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4h-4a4 4 0 0 0-4 4v4" /><polyline points="2 12 6 16 10 12" />
    <path d="M10 20h4a4 4 0 0 0 4-4v-4" /><polyline points="22 12 18 8 14 12" />
  </svg>
)

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

function ToggleChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-glass"
      style={{
        background: active ? 'rgba(108, 180, 238, 0.12)' : 'transparent',
        color: active ? '#4A90D9' : 'var(--text-muted)',
        border: `1px solid ${active ? 'rgba(108, 180, 238, 0.25)' : 'var(--canvas-border)'}`,
      }}
    >
      {label}
    </button>
  )
}

export default function FindReplace({ isOpen, onClose }: FindReplaceProps) {
  if (!isOpen) return null
  return <FindReplacePanel onClose={onClose} />
}

function FindReplacePanel({ onClose }: { onClose: () => void }) {
  const [content, setContent] = useState(() => useEditorStore.getState().content)
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [matchCase, setMatchCase] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [isReplaceMode, setIsReplaceMode] = useState(false)
  const [matchCount, setMatchCount] = useState(0)
  const findInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (findInputRef.current) {
      setTimeout(() => findInputRef.current?.focus(), 100)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = useEditorStore.subscribe((state) => {
      setContent(state.content)
    })
    return () => unsubscribe()
  }, [])

  // Count matches
  useEffect(() => {
    if (!findText) { setMatchCount(0); return }
    try {
      const flags = matchCase ? 'g' : 'gi'
      const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = wholeWord ? `\\b${escaped}\\b` : escaped
      const regex = new RegExp(pattern, flags)
      const matches = content.match(regex)
      setMatchCount(matches ? matches.length : 0)
    } catch {
      setMatchCount(0)
    }
  }, [findText, content, matchCase, wholeWord])

  const doReplace = (all: boolean) => {
    if (!findText) return
    const { content: liveContent, setContent } = useEditorStore.getState()
    const flags = matchCase ? (all ? 'g' : '') : (all ? 'gi' : 'i')
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = wholeWord ? `\\b${escaped}\\b` : escaped
    try {
      const regex = new RegExp(pattern, flags)
      const newContent = liveContent.replace(regex, replaceText)
      setContent(newContent)
    } catch { /* noop */ }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 animate-backdrop-in"
        style={{ background: 'rgba(0, 0, 0, 0.15)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Panel — slides in from top center */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[440px] animate-slide-in-top card-glass"
        style={{ padding: '20px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconSearch />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {isReplaceMode ? 'Find & Replace' : 'Find'}
            </h2>
            {findText && (
              <span
                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: matchCount > 0 ? 'rgba(108, 180, 238, 0.1)' : 'rgba(255, 95, 87, 0.1)',
                  color: matchCount > 0 ? '#4A90D9' : '#FF5F57',
                }}
              >
                {matchCount} {matchCount === 1 ? 'match' : 'matches'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-glass"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--canvas-surface-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <IconClose />
          </button>
        </div>

        <div className="space-y-3">
          {/* Find input */}
          <input
            ref={findInputRef}
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Find in document..."
            className="input-glass"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'Enter' && isReplaceMode) doReplace(false)
            }}
          />

          {/* Replace input */}
          {isReplaceMode && (
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              className="input-glass"
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose()
                if (e.key === 'Enter' && e.shiftKey) doReplace(true)
                else if (e.key === 'Enter') doReplace(false)
              }}
            />
          )}

          {/* Options */}
          <div className="flex items-center gap-2">
            <ToggleChip active={matchCase} onClick={() => setMatchCase(!matchCase)} label="Aa" />
            <ToggleChip active={wholeWord} onClick={() => setWholeWord(!wholeWord)} label="W" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setIsReplaceMode(!isReplaceMode)}
              className="btn-glass flex-1 !gap-1.5"
            >
              <IconReplace />
              {isReplaceMode ? 'Find Only' : 'Replace'}
            </button>
            {isReplaceMode && (
              <>
                <button onClick={() => doReplace(false)} className="btn-accent flex-1">
                  Replace
                </button>
                <button onClick={() => doReplace(true)} className="btn-accent flex-1" style={{ background: 'var(--gradient-lavender)' }}>
                  All
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
