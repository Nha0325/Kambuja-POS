import { useEffect } from "react"

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  variant = "danger",
  onConfirm, 
  onCancel,
  isProcessing = false
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isProcessing) {
        onCancel()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onCancel, isProcessing])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/50 dark:bg-[#020617]/80 backdrop-blur-sm" onClick={!isProcessing ? onCancel : undefined}>
      <div 
        className="bg-[#ffffff] dark:bg-[#111113] rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-[#e5e7eb] dark:border-[#27272a]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#020617] dark:text-[#f8fafc] mb-2">
            {title}
          </h3>
          <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">
            {message}
          </p>
        </div>
        <div className="p-4 border-t border-[#e5e7eb] dark:border-[#27272a] flex justify-end gap-3 bg-[#f8fafc] dark:bg-[#09090b]">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-6 bg-[#ffffff] dark:bg-[#111113] text-[#64748b] dark:text-[#a1a1aa] border border-[#e5e7eb] dark:border-[#27272a] font-bold rounded-lg hover:bg-[#f8fafc] dark:hover:bg-[#09090b] transition-colors"
            disabled={isProcessing}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-10 px-6 text-white font-bold rounded-lg transition-colors ${
              variant === "danger" 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-[#06b6d4] hover:bg-[#06b6d4]/90"
            }`}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
