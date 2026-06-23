import { pageHeaderDescriptionClass, pageHeaderTitleClass } from "../adminManagerUi"

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
    <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.05em] text-slate-700 shadow-sm">
      <span className={`h-2 w-2 rounded-full ${isActive ? "bg-green-500" : "bg-yellow-500"}`} />
      {status || "Unknown"}
    </span>
  )
}

export function TableEmpty({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-slate-500 sm:px-5">
        {children}
      </td>
    </tr>
  )
}
