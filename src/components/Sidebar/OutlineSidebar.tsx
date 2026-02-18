import { useEditorStore } from '../../stores/editorStore'
import { extractHeadings } from '../../utils/markdown'
import { useState, useEffect } from 'react'

const IconOutline = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" />
  </svg>
)

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function OutlineSidebar() {
  const { content, viewMode } = useEditorStore()
  const [headings, setHeadings] = useState<Array<{ level: number; text: string; id: string }>>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const extracted = extractHeadings(content)
    setHeadings(extracted)
  }, [content, viewMode])

  // Keep heading IDs in the rendered document aligned with the extracted outline.
  useEffect(() => {
    if (viewMode !== 'wysiwyg' || headings.length === 0) return

    const raf = requestAnimationFrame(() => {
      const headingElements = document.querySelectorAll('.ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4, .ProseMirror h5, .ProseMirror h6')
      headingElements.forEach((el, index) => {
        const heading = headings[index]
        if (heading) {
          (el as HTMLElement).id = heading.id
        }
      })
    })

    return () => cancelAnimationFrame(raf)
  }, [headings, viewMode])

  // Listen for Ctrl+Shift+O
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const scrollToHeading = (id: string) => {
    setActiveId(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const levelColors = [
    '', // 0 unused
    '#4A90D9', // H1
    '#6CB4EE', // H2
    '#9B8AD4', // H3
    '#B8A9E8', // H4
    '#5BA3A3', // H5
    '#7EC8C8', // H6
  ]

  return (
    <>
      {/* Toggle button */}
      {headings.length > 0 && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn-glass absolute left-3 top-16 z-50 !p-2 !rounded-card animate-fade-in"
          title="Toggle Outline (Ctrl+Shift+O)"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          <IconOutline />
        </button>
      )}

      {/* Sidebar panel */}
      {isOpen && (
        <aside
          className="w-60 shrink-0 flex flex-col overflow-hidden animate-slide-in-left z-40"
          style={{
            background: 'var(--canvas-surface)',
            backdropFilter: 'blur(32px) saturate(200%)',
            WebkitBackdropFilter: 'blur(32px) saturate(200%)',
            borderRight: '1px solid var(--canvas-border)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--canvas-border)' }}>
            <div className="flex items-center gap-2">
              <IconOutline />
              <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Outline</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 flex items-center justify-center rounded-md transition-glass"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--canvas-surface-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <IconClose />
            </button>
          </div>

          {/* Heading list */}
          <nav className="flex-1 overflow-auto custom-scrollbar p-2 space-y-0.5">
            {headings.length === 0 ? (
              <p className="text-[12px] px-3 py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                No headings found
              </p>
            ) : (
              headings.map((heading, index) => {
                const isActive = activeId === heading.id
                const indent = (heading.level - 1) * 12
                const color = levelColors[heading.level] || 'var(--text-secondary)'

                return (
                  <button
                    key={index}
                    onClick={() => scrollToHeading(heading.id)}
                    className="group flex items-center gap-2 w-full text-left rounded-lg py-1.5 transition-glass"
                    style={{
                      paddingLeft: `${12 + indent}px`,
                      paddingRight: '12px',
                      background: isActive ? 'rgba(108, 180, 238, 0.08)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'var(--canvas-surface-hover)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {/* Level indicator dot */}
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 transition-glass"
                      style={{
                        background: isActive ? color : 'var(--canvas-border-strong)',
                        boxShadow: isActive ? `0 0 6px ${color}40` : 'none',
                      }}
                    />
                    <span
                      className="truncate transition-glass"
                      style={{
                        fontSize: heading.level === 1 ? '13px' : '12px',
                        fontWeight: heading.level <= 2 ? 600 : 400,
                        color: isActive ? color : 'var(--text-secondary)',
                      }}
                    >
                      {heading.text}
                    </span>
                  </button>
                )
              })
            )}
          </nav>
        </aside>
      )}
    </>
  )
}
