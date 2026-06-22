export const pageHeaderTitleClass = "text-2xl font-semibold text-slate-900 md:text-3xl"
export const pageHeaderDescriptionClass = "mt-1 text-sm leading-6 text-slate-500"
export const cardClass = "rounded-2xl border border-violet-100 bg-white shadow-sm shadow-violet-100/50"
export const subtleCardClass = "rounded-2xl border border-violet-100 bg-violet-50/60"
export const labelClass = "block text-xs font-bold uppercase tracking-[0.06em] text-slate-500"
export const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
export const selectClass = inputClass
export const primaryButtonClass = "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition-all hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
export const secondaryButtonClass = "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 text-sm font-semibold text-violet-700 transition-colors hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
export const dangerButtonClass = "inline-flex h-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
export const tableHeadClass = "border-b border-violet-100 bg-violet-50/70 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500"
export const tableHeadCellClass = "whitespace-nowrap px-4 py-3 align-middle sm:px-5"
export const tableCellClass = "whitespace-nowrap px-4 py-4 align-middle text-sm text-slate-700 sm:px-5"

export const formatRiel = (value) => `${Number(value || 0).toLocaleString()} ៛`

export const getInitials = (value = "") => {
  const words = String(value).trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "--"
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("")
}
