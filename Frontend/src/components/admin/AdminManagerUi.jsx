import { pageHeaderDescriptionClass, pageHeaderTitleClass } from "../../pages/admin-manager/adminManagerUi"

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className={pageHeaderTitleClass}>{title}</h1>
        {description && <p className={pageHeaderDescriptionClass}>{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatusBadge({ status }) {
  const isActive = status === "ACTIVE"
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#ffffff] dark:bg-[#111113] px-3 py-1 text-xs font-bold uppercase tracking-[0.05em] text-[#020617] dark:text-[#f8fafc]">
      <span className={`h-2 w-2 rounded-full ${isActive ? "bg-green-500" : "bg-yellow-500"}`} />
      {status || "Unknown"}
    </span>
  )
}

export function TableEmpty({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-[#64748b] dark:text-[#a1a1aa] sm:px-5 border-b border-[#e5e7eb] dark:border-[#27272a]">
        {children}
      </td>
    </tr>
  )
}
