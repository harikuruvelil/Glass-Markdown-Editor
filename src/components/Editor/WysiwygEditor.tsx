import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useEffect, useCallback, useRef } from 'react'
import EditorToolbar from './EditorToolbar'
import { markdownToHtml, htmlToMarkdown } from '../../utils/markdownConverter'

export default function WysiwygEditor() {
  const { content, setContent, setHasUnsavedChanges, saveFile } = useEditorStore()
  const { autoSave, fontSize, fontFamily } = useSettingsStore()
  const isUpdatingFromStore = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: markdownToHtml(content),
    onUpdate: ({ editor }) => {
      if (isUpdatingFromStore.current) return
      const html = editor.getHTML()
      const markdown = htmlToMarkdown(html)
      setContent(markdown)
      setHasUnsavedChanges(true)
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror',
        spellcheck: 'true',
      },
      handleClickOn: (view, pos, _node, _nodePos, event) => {
        const dom = (event as MouseEvent).target as HTMLElement
        if (dom.tagName === 'INPUT' && dom.getAttribute('type') === 'checkbox') {
          const { state } = view
          const { tr } = state
          const node = state.doc.nodeAt(pos)

          if (node && node.type.name === 'taskItem') {
            const checked = !node.attrs.checked
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, checked })
            view.dispatch(tr)

            // Auto-save after checkbox toggle
            setTimeout(() => {
              if (editor) {
                const html = editor.getHTML()
                const markdown = htmlToMarkdown(html)
                setContent(markdown)
                setHasUnsavedChanges(true)
                if (autoSave) {
                  setTimeout(() => saveFile(), 100)
                }
              }
            }, 0)

            return true
          }
        }
        return false
      },
    },
  })

  // Sync content from store
  useEffect(() => {
    if (editor) {
      const currentHtml = editor.getHTML()
      const currentMarkdown = htmlToMarkdown(currentHtml)
      const expectedHtml = markdownToHtml(content)
      // Only force replace editor HTML when store content truly came from outside this editor.
      // This avoids degrading task-list nodes into plain "[ ]" text when markdown renderer differs.
      if (currentMarkdown !== content && currentHtml !== expectedHtml) {
        isUpdatingFromStore.current = true
        editor.commands.setContent(expectedHtml)
        setTimeout(() => { isUpdatingFromStore.current = false }, 0)
      }
    }
  }, [content, editor])

  // Broken image placeholder
  const handleImageError = useCallback((e: Event) => {
    const img = e.target as HTMLImageElement
    if (!img) return

    const alt = img.alt || 'Image'
    const placeholder = document.createElement('div')
    placeholder.className = 'image-placeholder'
    placeholder.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span>${alt}</span>
    `
    img.parentElement?.replaceChild(placeholder, img)
  }, [])

  useEffect(() => {
    if (!editor) return
    const attachImageHandlers = () => {
      editor.view.dom.querySelectorAll('img').forEach((img) => {
        img.removeEventListener('error', handleImageError)
        img.addEventListener('error', handleImageError)
      })
    }
    editor.on('update', attachImageHandlers)
    attachImageHandlers()
    return () => {
      editor.off('update', attachImageHandlers)
      editor.view.dom.querySelectorAll('img').forEach((img) => {
        img.removeEventListener('error', handleImageError)
      })
    }
  }, [editor, handleImageError])

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-2 animate-pulse-subtle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" />
          </svg>
          <span className="text-sm font-medium">Loading editor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full flex flex-col" style={{ fontFamily, fontSize: `${fontSize}px` }}>
      <div className="shrink-0 px-4 pt-3 min-h-[56px]">
        <EditorToolbar editor={editor} />
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
