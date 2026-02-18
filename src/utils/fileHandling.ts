import { useEditorStore } from '../stores/editorStore'
import { useDialogStore } from '../stores/dialogStore'

let isFileActionInProgress = false

async function runExclusiveFileAction(action: () => Promise<void>) {
  if (isFileActionInProgress) {
    return
  }

  isFileActionInProgress = true
  try {
    await action()
  } finally {
    isFileActionInProgress = false
  }
}

async function resolveUnsavedChangesBeforeContinue(action: string): Promise<boolean> {
  const { hasUnsavedChanges, saveFile } = useEditorStore.getState()
  if (!hasUnsavedChanges) {
    return true
  }

  const result = await showUnsavedChangesDialog(action)
  if (result === 'cancel') {
    return false
  }

  if (result === 'save') {
    const didSave = await saveFile()
    if (!didSave || useEditorStore.getState().hasUnsavedChanges) {
      return false
    }
  }

  return true
}

export async function handleFileOpen() {
  await runExclusiveFileAction(async () => {
    const canContinue = await resolveUnsavedChangesBeforeContinue('open another file')
    if (!canContinue) {
      return
    }

    const { openFile } = useEditorStore.getState()
    await openFile()
  })
}

export async function handleFileSave() {
  const { saveFile } = useEditorStore.getState()
  await saveFile()
}

export async function handleFileSaveAs() {
  const { saveFileAs } = useEditorStore.getState()
  await saveFileAs()
}

export async function handleNewFile() {
  await runExclusiveFileAction(async () => {
    const canContinue = await resolveUnsavedChangesBeforeContinue('create a new file')
    if (!canContinue) {
      return
    }

    const { newFile } = useEditorStore.getState()
    newFile()
  })
}

async function showUnsavedChangesDialog(action: string): Promise<'save' | 'discard' | 'cancel'> {
  return useDialogStore.getState().requestUnsavedDecision(action)
}

// Handle drag and drop
export function setupDragAndDrop() {
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      const file = files[0]
      const loweredFileName = file.name.toLowerCase()
      if (loweredFileName.endsWith('.md') || loweredFileName.endsWith('.markdown')) {
        await runExclusiveFileAction(async () => {
          const canContinue = await resolveUnsavedChangesBeforeContinue('open the dropped file')
          if (!canContinue) {
            return
          }

          const droppedPath = (file as File & { path?: string }).path
          if (droppedPath) {
            const { openFilePath } = useEditorStore.getState()
            await openFilePath(droppedPath)
            return
          }

          const { setCurrentFile, setContent } = useEditorStore.getState()
          await new Promise<void>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (event) => {
              const content = event.target?.result as string
              setCurrentFile(null)
              setContent(content)
              resolve()
            }
            reader.onerror = () => reject(reader.error)
            reader.readAsText(file)
          })
        })
      }
    }
  }

  window.addEventListener('dragover', handleDragOver)
  window.addEventListener('drop', handleDrop)

  return () => {
    window.removeEventListener('dragover', handleDragOver)
    window.removeEventListener('drop', handleDrop)
  }
}
