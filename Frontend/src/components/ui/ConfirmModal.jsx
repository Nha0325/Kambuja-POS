function ConfirmModal({ open, title = "Confirm", message, onConfirm, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-[#020617] dark:text-[#f8fafc]">{title}</h2>
        <p className="mt-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="rounded-lg border border-[#e5e7eb] bg-white text-[#020617] hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5 px-4 py-2 text-sm font-semibold transition-colors" onClick={onClose}>Cancel</button>
          <button type="button" className="rounded-lg bg-red-600 text-white hover:bg-red-700 px-4 py-2 text-sm font-semibold transition-colors" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
