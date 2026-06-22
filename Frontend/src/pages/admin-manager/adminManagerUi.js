export const pageHeaderTitleClass = "text-2xl font-bold text-gray-950 md:text-3xl"
export const pageHeaderDescriptionClass = "mt-1 text-sm leading-6 text-gray-600"
export const cardClass = "rounded-xl border border-gray-300 bg-white shadow-sm"
export const subtleCardClass = "rounded-xl border border-gray-300 bg-[#f3f4f5]"
export const labelClass = "block text-xs font-bold uppercase tracking-[0.05em] text-gray-500"
export const inputClass = "h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-950 outline-none transition-all focus:border-gray-950 focus:ring-1 focus:ring-gray-950"
export const selectClass = inputClass
export const primaryButtonClass = "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
export const secondaryButtonClass = "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-950 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
export const dangerButtonClass = "inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
export const tableHeadClass = "bg-[#f3f4f5] text-left text-xs font-bold uppercase tracking-[0.05em] text-gray-500"
export const tableHeadCellClass = "px-6 py-4"
export const tableCellClass = "px-6 py-4 text-sm text-gray-700"

export const formatRiel = (value) => `${Number(value || 0).toLocaleString()} ៛`

export const getInitials = (value = "") => {
  const words = String(value).trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "--"
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("")
}
