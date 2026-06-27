export const pageHeaderTitleClass = "text-2xl font-semibold text-[#020617] dark:text-[#f8fafc] md:text-3xl"
export const pageHeaderDescriptionClass = "mt-1 text-sm leading-6 text-[#64748b] dark:text-[#a1a1aa]"
export const cardClass = "rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113]"
export const subtleCardClass = "rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b]"
export const labelClass = "block text-xs font-bold uppercase tracking-[0.06em] text-[#64748b] dark:text-[#a1a1aa]"
export const inputClass = "h-11 w-full rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] px-4 text-sm text-[#020617] dark:text-[#f8fafc] outline-none transition-all placeholder:text-[#64748b] dark:placeholder:text-[#a1a1aa] focus:border-[#7033ff] focus:ring-1 focus:ring-[#7033ff]"
export const selectClass = inputClass
export const primaryButtonClass = "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7033ff] px-5 text-sm font-semibold text-[#ffffff] transition-all hover:bg-[#7033ff]/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
export const secondaryButtonClass = "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] px-4 text-sm font-semibold text-[#020617] dark:text-[#f8fafc] transition-colors hover:bg-[#f8fafc] dark:hover:bg-[#09090b] disabled:cursor-not-allowed disabled:opacity-60"
export const dangerButtonClass = "inline-flex h-9 items-center justify-center rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 px-3 text-xs font-semibold text-red-700 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
export const tableHeadClass = "border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[#64748b] dark:text-[#a1a1aa]"
export const tableHeadCellClass = "whitespace-nowrap px-4 py-3 align-middle sm:px-5"
export const tableCellClass = "whitespace-nowrap border-b border-[#e5e7eb] dark:border-[#27272a] px-4 py-4 align-middle text-sm text-[#020617] dark:text-[#f8fafc] sm:px-5"
export const modalClass = "fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/50 p-4 backdrop-blur-sm"

export const formatRiel = (value) => `$${Number(value || 0).toFixed(2)}`

export const getInitials = (value = "") => {
  const words = String(value).trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "--"
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("")
}
