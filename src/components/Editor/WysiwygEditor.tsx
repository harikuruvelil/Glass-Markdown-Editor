import { useEditor, EditorContent, type Editor } from '@tiptap/react'
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
  const setContent = useEditorStore((state) => state.setContent)
  const fontSize = useSettingsStore((state) => state.fontSize)
  const fontFamily = useSettingsStore((state) => state.fontFamily)
  const isUpdatingFromStore = useRef(false)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleSyncRef = useRef<number | null>(null)
  const hasPendingSyncRef = useRef(false)
  const lastSyncedMarkdownRef = useRef(useEditorStore.getState().content)

  const cancelPendingSync = useCallback(() => {
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current)
      syncTimerRef.current = null
    }
    if (idleSyncRef.current !== null) {
      const cancelIdle = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
      if (typeof cancelIdle === 'function') {
        cancelIdle(idleSyncRef.current)
      }
      idleSyncRef.current = null
    }
  }, [])

  const commitEditorToStore = useCallback(
    (instance: Editor | null, force = false) => {
      if (!instance || isUpdatingFromStore.current) return
      if (!force && !hasPendingSyncRef.current) return
      const markdown = htmlToMarkdown(instance.getHTML())
      lastSyncedMarkdownRef.current = markdown
      hasPendingSyncRef.current = false
      setContent(markdown)
    },
    [setContent]
  )

  const scheduleCommitEditorToStore = useCallback(
    (instance: Editor | null, delayMs = 260, force = false) => {
      if (!instance) return
      cancelPendingSync()
      syncTimerRef.current = setTimeout(() => {
        syncTimerRef.current = null
        const run = () => {
          idleSyncRef.current = null
          commitEditorToStore(instance, force)
        }
        const requestIdle = (window as Window & { requestIdleCallback?: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number }).requestIdleCallback
        if (typeof requestIdle === 'function') {
          idleSyncRef.current = requestIdle(() => run(), { timeout: 350 })
        } else {
          run()
        }
      }, delayMs)
    },
    [cancelPendingSync, commitEditorToStore]
  )

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
    content: markdownToHtml(lastSyncedMarkdownRef.current),
    onUpdate: ({ editor, transaction }) => {
      if (!transaction.docChanged) return
      if (isUpdatingFromStore.current) return
      hasPendingSyncRef.current = true
      scheduleCommitEditorToStore(editor)
    },
    onBlur: ({ editor }) => {
      scheduleCommitEditorToStore(editor, 420)
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
            scheduleCommitEditorToStore(editor, 0)

            return true
          }
        }
        return false
      },
    },
  })

  useEffect(() => {
    if (!editor) return

    let previousContent = useEditorStore.getState().content
    const unsubscribe = useEditorStore.subscribe((state) => {
      const nextContent = state.content
      if (nextContent === previousContent) {
        return
      }
      previousContent = nextContent

      if (nextContent === lastSyncedMarkdownRef.current) {
        hasPendingSyncRef.current = false
        return
      }

      const expectedHtml = markdownToHtml(nextContent)
      if (editor.getHTML() === expectedHtml) {
        lastSyncedMarkdownRef.current = nextContent
        hasPendingSyncRef.current = false
        return
      }

      cancelPendingSync()

      isUpdatingFromStore.current = true
      editor.commands.setContent(expectedHtml, false)
      lastSyncedMarkdownRef.current = nextContent
      hasPendingSyncRef.current = false
      requestAnimationFrame(() => {
        isUpdatingFromStore.current = false
      })
    })

    return () => {
      unsubscribe()
    }
  }, [cancelPendingSync, editor])

  useEffect(() => {
    return () => {
      cancelPendingSync()
      if (hasPendingSyncRef.current) {
        commitEditorToStore(editor, true)
      }
    }
  }, [cancelPendingSync, commitEditorToStore, editor])

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
    const onImageErrorCapture = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLImageElement)) {
        return
      }
      handleImageError(event)
    }
    editor.view.dom.addEventListener('error', onImageErrorCapture, true)
    return () => {
      editor.view.dom.removeEventListener('error', onImageErrorCapture, true)
    }
  }, [editor, handleImageError])

  useEffect(() => {
    if (!editor) return

    const onSyncRequest = (event: Event) => {
      const custom = event as CustomEvent<{ done?: () => void }>
      if (hasPendingSyncRef.current) {
        cancelPendingSync()
        commitEditorToStore(editor, true)
      }
      custom.detail?.done?.()
    }

    window.addEventListener('editor-sync-request', onSyncRequest as EventListener)
    return () => {
      window.removeEventListener('editor-sync-request', onSyncRequest as EventListener)
    }
  }, [cancelPendingSync, commitEditorToStore, editor])

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
