import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useState, useEffect, useRef, useMemo } from 'react'

export default function RawEditor() {
  const content = useEditorStore((state) => state.content)
  const setContent = useEditorStore((state) => state.setContent)
  const codeFontFamily = useSettingsStore((state) => state.codeFontFamily)
  const fontSize = useSettingsStore((state) => state.fontSize)
  const wordWrap = useSettingsStore((state) => state.wordWrap)
  const [localContent, setLocalContent] = useState(content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalContent(content)
  }, [content])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setLocalContent(newContent)
    setContent(newContent)
  }

  // Sync scroll between line numbers and textarea
  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const lineCount = useMemo(() => {
    if (localContent.length === 0) return 1
    let lines = 1
    for (let i = 0; i < localContent.length; i += 1) {
      if (localContent.charCodeAt(i) === 10) {
        lines += 1
      }
    }
    return lines
  }, [localContent])

  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1),
    [lineCount]
  )

  return (
    <div className="h-full w-full flex relative" style={{ fontSize: `${Math.max(fontSize - 2, 12)}px` }}>
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="flex-shrink-0 overflow-hidden select-none py-12 pl-4 pr-3 text-right"
        style={{
          fontFamily: codeFontFamily || "'Cascadia Code', 'JetBrains Mono', monospace",
          color: 'var(--text-muted)',
          lineHeight: '1.65',
          borderRight: '1px solid var(--canvas-border)',
          minWidth: '48px',
        }}
      >
        {lineNumbers.map((lineNumber) => (
          <div key={lineNumber} className="leading-[1.65]" style={{ fontSize: '0.85em' }}>
            {lineNumber}
          </div>
        ))}
      </div>

      {/* Editor area */}
      <textarea
        ref={textareaRef}
        value={localContent}
        onChange={handleChange}
        onScroll={handleScroll}
        className="flex-1 py-12 px-6 bg-transparent resize-none outline-none custom-scrollbar"
        style={{
          fontFamily: codeFontFamily || "'Cascadia Code', 'JetBrains Mono', monospace",
          color: 'var(--text-primary)',
          lineHeight: '1.65',
          tabSize: 2,
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          wordWrap: wordWrap ? 'break-word' : 'normal',
          overflowWrap: wordWrap ? 'break-word' : 'normal',
        }}
        spellCheck={false}
        placeholder="Start writing markdown..."
      />
    </div>
  )
}
