import { Editor } from '@tiptap/react'

interface EditorToolbarProps {
  editor: Editor | null
}

/* ── Toolbar Icon components (line-style, 1.5 stroke) ── */
const TbBold = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6Z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6Z" />
  </svg>
)
const TbItalic = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
  </svg>
)
const TbStrike = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H8" /><line x1="4" y1="12" x2="20" y2="12" />
  </svg>
)
const TbCode = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
)
const TbLink = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)
const TbBulletList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" />
  </svg>
)
const TbOrderedList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </svg>
)
const TbCheckList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="6" height="6" rx="1" /><path d="M5 8l1 1 2-2" /><line x1="13" y1="8" x2="21" y2="8" /><rect x="3" y="13" width="6" height="6" rx="1" /><line x1="13" y1="16" x2="21" y2="16" />
  </svg>
)

function ToolbarButton({
  onAction,
  active,
  title,
  children,
}: {
  onAction: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onAction()
      }}
      title={title}
      className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-glass"
      style={{
        color: active ? '#4A90D9' : 'var(--text-secondary)',
        background: active ? 'rgba(108, 180, 238, 0.12)' : 'transparent',
        boxShadow: active ? '0 0 12px rgba(108, 180, 238, 0.15)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'var(--canvas-surface-hover)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 mx-0.5" style={{ background: 'var(--canvas-border-strong)' }} />
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  const toggleBulletList = () => {
    if (editor.isActive('bulletList')) {
      const toggledOff = editor.chain().focus().toggleBulletList().run()
      if (!toggledOff) {
        editor.chain().focus().clearNodes().run()
      }
      return
    }
    editor.chain().focus().toggleBulletList().run()
  }

  const toggleOrderedList = () => {
    if (editor.isActive('orderedList')) {
      const toggledOff = editor.chain().focus().toggleOrderedList().run()
      if (!toggledOff) {
        editor.chain().focus().clearNodes().run()
      }
      return
    }
    editor.chain().focus().toggleOrderedList().run()
  }

  const toggleTaskList = () => {
    if (editor.isActive('taskList')) {
      const toggledOff = editor.chain().focus().toggleTaskList().run()
      if (!toggledOff) {
        editor.chain().focus().clearNodes().run()
      }
      return
    }
    editor.chain().focus().toggleTaskList().run()
  }

  return (
    <div
      className="z-20 flex items-center gap-0.5 px-2 py-1.5 w-max max-w-full flex-wrap"
      style={{
        background: 'var(--canvas-surface)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        border: '1px solid var(--canvas-border)',
        borderRadius: '12px',
        boxShadow: 'var(--toolbar-shadow, 0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.15))',
      }}
    >
      <ToolbarButton onAction={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
        <TbBold />
      </ToolbarButton>
      <ToolbarButton onAction={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
        <TbItalic />
      </ToolbarButton>
      <ToolbarButton onAction={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
        <TbStrike />
      </ToolbarButton>

      <Divider />

      <ToolbarButton onAction={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code (Ctrl+Shift+K)">
        <TbCode />
      </ToolbarButton>
      <ToolbarButton
        onAction={() => {
          const url = window.prompt('Enter URL:')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }}
        active={editor.isActive('link')}
        title="Insert Link (Ctrl+K)"
      >
        <TbLink />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onAction={() => editor.chain().focus().setParagraph().run()}
        active={editor.isActive('paragraph')}
        title="Paragraph"
      >
        <span className="text-[11px] font-semibold">P</span>
      </ToolbarButton>

      {/* Heading buttons */}
      {([1, 2, 3] as const).map((level) => (
        <ToolbarButton
          key={level}
          onAction={() => {
            if (editor.isActive('heading', { level })) {
              editor.chain().focus().setParagraph().run()
              return
            }
            editor.chain().focus().setHeading({ level }).run()
          }}
          active={editor.isActive('heading', { level })}
          title={`Heading ${level}`}
        >
          <span className="text-[11px] font-bold">H{level}</span>
        </ToolbarButton>
      ))}

      <Divider />

      <ToolbarButton onAction={toggleBulletList} active={editor.isActive('bulletList')} title="Bullet List">
        <TbBulletList />
      </ToolbarButton>
      <ToolbarButton onAction={toggleOrderedList} active={editor.isActive('orderedList')} title="Numbered List">
        <TbOrderedList />
      </ToolbarButton>
      <ToolbarButton onAction={toggleTaskList} active={editor.isActive('taskList')} title="Task List">
        <TbCheckList />
      </ToolbarButton>
    </div>
  )
}
