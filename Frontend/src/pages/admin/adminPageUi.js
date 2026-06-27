export const adminSurface = {
  page: "w-full max-w-full space-y-6",
  header: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
  eyebrow: "text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-[#22D3EE]",
  title: "text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC] sm:text-3xl",
  description: "mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-[#A9A6BB]",
  primaryButton:
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 dark:bg-gradient-to-r dark:from-[#3350BF] dark:to-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
  secondaryButton:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] transition hover:bg-slate-50 dark:hover:bg-[#2A2E36] disabled:cursor-not-allowed disabled:opacity-60 shadow-sm",
  dangerIconButton:
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#1A1D22] text-red-500 transition hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:cursor-not-allowed disabled:opacity-60",
  iconButton:
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] text-slate-500 dark:text-[#A9A6BB] transition hover:border-violet-300 dark:hover:border-[#3350BF] hover:bg-violet-50 dark:hover:bg-[#3350BF]/10 hover:text-violet-700 dark:hover:text-[#22D3EE] disabled:cursor-not-allowed disabled:opacity-60",
  card: "rounded-2xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] p-6 shadow-sm dark:shadow-lg dark:shadow-black/10",
  statGrid: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
  statCard: "rounded-2xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] p-6 shadow-sm dark:shadow-lg dark:shadow-black/10 transition hover:shadow-md dark:hover:shadow-xl hover:border-violet-200 dark:hover:border-[#3350BF]/50",
  statIcon: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-[#3350BF]/10 text-violet-600 dark:text-[#22D3EE]",
  statLabel: "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#6B7280]",
  statValue: "mt-3 text-3xl font-bold text-slate-900 dark:text-[#F8FAFC]",
  toolbar: "border-b border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] px-5 py-4",
  tableShell: "overflow-hidden rounded-2xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] shadow-sm dark:shadow-lg dark:shadow-black/10",
  tableWrap: "max-w-full overflow-x-auto",
  table: "w-full border-collapse text-left",
  tableHead: "bg-slate-50 dark:bg-[#111318] text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#6B7280]",
  th: "whitespace-nowrap px-5 py-4 border-b border-slate-200 dark:border-[#2A2E36]",
  td: "whitespace-nowrap px-5 py-4 text-sm text-slate-700 dark:text-[#F8FAFC]",
  row: "border-b border-slate-100 dark:border-[#2A2E36] text-sm transition-colors hover:bg-slate-50/50 dark:hover:bg-[#22262D]",
  input:
    "h-11 min-h-0 rounded-xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#111318] px-4 py-2 text-sm text-slate-900 dark:text-[#F8FAFC] outline-none placeholder-slate-400 dark:placeholder-[#6B7280] transition focus-within:border-violet-500 dark:focus-within:border-[#22D3EE] focus-within:ring-2 focus-within:ring-violet-500/20 dark:focus-within:ring-[#22D3EE]/20 focus:border-violet-500 dark:focus:border-[#22D3EE] focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-[#22D3EE]/20 shadow-sm",
  select:
    "h-11 min-h-0 rounded-xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#111318] px-4 py-2 text-sm text-slate-900 dark:text-[#F8FAFC] outline-none transition focus:border-violet-500 dark:focus:border-[#22D3EE] focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-[#22D3EE]/20 shadow-sm",
  footer: "flex flex-col gap-3 border-t border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
  pageSizeSelect:
    "h-11 min-h-0 w-20 rounded-xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#111318] px-3 py-2 text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] outline-none transition focus:border-violet-500 dark:focus:border-[#22D3EE] focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-[#22D3EE]/20 shadow-sm",
  paginationMeta:
    "inline-flex min-h-11 items-center rounded-xl border border-slate-200 dark:border-[#2A2E36] bg-slate-50 dark:bg-[#111318] px-4 text-sm font-semibold text-slate-500 dark:text-[#A9A6BB]",
  paginationButton:
    "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] text-slate-700 dark:text-[#F8FAFC] transition hover:border-violet-300 dark:hover:border-[#3350BF] hover:bg-violet-50 dark:hover:bg-[#3350BF]/10 hover:text-violet-700 dark:hover:text-[#22D3EE] disabled:cursor-not-allowed disabled:text-slate-400 dark:disabled:text-[#6B7280] disabled:opacity-50 shadow-sm",
  paginationCurrent:
    "inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border border-violet-600 dark:border-[#3350BF] bg-violet-50 dark:bg-[#3350BF]/20 px-4 text-sm font-bold text-violet-700 dark:text-[#22D3EE]",
  badge: "inline-flex items-center rounded-full border border-slate-200 dark:border-[#2A2E36] bg-slate-50 dark:bg-[#111318] px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-[#A9A6BB]",
}
