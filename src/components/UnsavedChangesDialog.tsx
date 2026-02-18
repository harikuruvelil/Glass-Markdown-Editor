import { useEffect } from 'react'
import { useDialogStore } from '../stores/dialogStore'

export default function UnsavedChangesDialog() {
  const {
    isUnsavedDialogOpen,
    unsavedDialogTitle,
    unsavedDialogMessage,
    unsavedDialogAction,
    resolveUnsavedDecision,
  } = useDialogStore()

  useEffect(() => {
    if (!isUnsavedDialogOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        resolveUnsavedDecision('cancel')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isUnsavedDialogOpen, resolveUnsavedDecision])

  if (!isUnsavedDialogOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 animate-backdrop-in"
        style={{ background: 'rgba(10, 10, 16, 0.36)' }}
        onClick={() => resolveUnsavedDecision('cancel')}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
        <div className="card-glass w-[460px] max-w-full p-5 pointer-events-auto animate-fade-in">
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {unsavedDialogTitle}
          </h2>
          <p className="text-sm leading-6 mb-4" style={{ color: 'var(--text-secondary)' }}>
            {unsavedDialogMessage}
          </p>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
            Action: {unsavedDialogAction}
          </p>

          <div className="flex items-center justify-end gap-2">
            <button
              className="btn-glass !px-3.5 !py-2 !text-xs"
              onClick={() => resolveUnsavedDecision('cancel')}
            >
              Cancel
            </button>
            <button
              className="btn-glass !px-3.5 !py-2 !text-xs"
              onClick={() => resolveUnsavedDecision('discard')}
            >
              Don't Save
            </button>
            <button
              className="btn-accent !px-3.5 !py-2 !text-xs"
              onClick={() => resolveUnsavedDecision('save')}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
