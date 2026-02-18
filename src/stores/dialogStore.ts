import { create } from 'zustand'

export type UnsavedChangesDecision = 'save' | 'discard' | 'cancel'

interface DialogState {
  isUnsavedDialogOpen: boolean
  unsavedDialogTitle: string
  unsavedDialogMessage: string
  unsavedDialogAction: string
  unsavedResolver: ((decision: UnsavedChangesDecision) => void) | null
  requestUnsavedDecision: (action: string) => Promise<UnsavedChangesDecision>
  resolveUnsavedDecision: (decision: UnsavedChangesDecision) => void
}

export const useDialogStore = create<DialogState>((set, get) => ({
  isUnsavedDialogOpen: false,
  unsavedDialogTitle: 'Unsaved changes',
  unsavedDialogMessage: 'This file has unsaved changes. Do you want to save before continuing?',
  unsavedDialogAction: 'continue',
  unsavedResolver: null,

  requestUnsavedDecision: async (action: string) => {
    const current = get()
    if (current.isUnsavedDialogOpen) {
      return 'cancel'
    }

    return new Promise<UnsavedChangesDecision>((resolve) => {
      set({
        isUnsavedDialogOpen: true,
        unsavedDialogAction: action,
        unsavedResolver: resolve,
      })
    })
  },

  resolveUnsavedDecision: (decision: UnsavedChangesDecision) => {
    const resolver = get().unsavedResolver
    set({
      isUnsavedDialogOpen: false,
      unsavedResolver: null,
    })
    if (resolver) {
      resolver(decision)
    }
  },
}))
