import { useState, useCallback } from "react"
import { ConfirmContext } from "./useConfirm"
import ConfirmModal from "./ConfirmModal"

export default function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "danger",
    resolve: null,
    isProcessing: false
  })

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || "Confirm",
        message: options.message || "Are you sure?",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "danger",
        resolve,
        isProcessing: false
      })
    })
  }, [])

  const setConfirmProcessing = useCallback((isProcessing) => {
    setConfirmState(prev => ({ ...prev, isProcessing }))
  }, [])

  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false, isProcessing: false, resolve: null }))
  }, [])

  const handleConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isProcessing: true }))
    if (confirmState.resolve) {
      confirmState.resolve(true)
    }
  }, [confirmState])

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false)
    }
    closeConfirm()
  }, [confirmState, closeConfirm])

  return (
    <ConfirmContext.Provider value={{ confirm, setConfirmProcessing, closeConfirm }}>
      {children}
      <ConfirmModal 
        {...confirmState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  )
}
