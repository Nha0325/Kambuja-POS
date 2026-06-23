import { useCallback, useEffect, useMemo, useState } from "react"
import {
  FaArrowsRotate,
  FaCalendarDays,
  FaClock,
  FaDownload,
  FaFilter,
  FaLayerGroup,
  FaListCheck,
  FaMagnifyingGlass,
  FaTerminal,
} from "react-icons/fa6"
import { adminManagerService } from "../../../services/adminManager.service"
import { downloadCsv } from "../../../utils/downloadCsv"
import { formatApiError } from "../../../utils/formatApiError"
import formatDate from "../../../utils/formatDate"
import {
  cardClass,
  inputClass,
  secondaryButtonClass,
  tableCellClass,
  tableHeadCellClass,
  tableHeadClass,
} from "../adminManagerUi"
import { PageHeader, TableEmpty } from "../components/AdminManagerUi"

const dateFormat = "DD/MMM/YYYY"
const timeFormat = "HH:mm"
const dateTimeFormat = `${dateFormat} ${timeFormat}`

function SystemLogs() {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("ALL")

  const loadLogs = useCallback(() => {
    setIsLoading(true)
    setError("")
    return adminManagerService.auditLogs()
      .then((response) => setLogs(response.data.result || []))
      .catch((loadError) => {
        if (loadError?.response?.status !== 401) {
          setError(formatApiError(loadError) || "Unable to load system logs")
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const actionOptions = useMemo(() => (
    Array.from(new Set(logs.map((log) => log.action).filter(Boolean))).sort()
  ), [logs])

  const displayedLogs = useMemo(() => {
    const term = search.trim().toLowerCase()

    return logs.filter((log) => (
      (actionFilter === "ALL" || log.action === actionFilter)
      && (!term
        || log.user?.username?.toLowerCase().includes(term)
        || log.user?.email?.toLowerCase().includes(term)
        || log.shopId?.name?.toLowerCase().includes(term)
        || log.action?.toLowerCase().includes(term)
        || log.entityType?.toLowerCase().includes(term)
        || formatDate(log.createdAt, dateTimeFormat).toLowerCase().includes(term))
    ))
  }, [actionFilter, logs, search])

  const exportLogs = () => {
    downloadCsv(
      "admin-manager-system-logs.csv",
      [
        { label: "Date", value: (log) => formatDate(log.createdAt, dateFormat) },
        { label: "Time", value: (log) => formatDate(log.createdAt, timeFormat) },
        { label: "User", value: (log) => log.user?.username || "System" },
        { label: "User Email", value: (log) => log.user?.email || "" },
        { label: "Shop", value: (log) => log.shopId?.name || "Platform" },
        { label: "Action", value: (log) => log.action || "" },
        { label: "Entity", value: (log) => log.entityType || "" },
      ],
      displayedLogs
    )
  }

  const latestLog = logs[0]
  const summaryCards = [
    { label: "Audit Events", value: logs.length.toLocaleString(), icon: FaListCheck },
    { label: "Matching Results", value: displayedLogs.length.toLocaleString(), icon: FaFilter },
    { label: "Action Types", value: actionOptions.length.toLocaleString(), icon: FaLayerGroup },
    {
      label: "Latest Time",
      value: latestLog ? formatDate(latestLog.createdAt, dateTimeFormat) : "No audit log yet",
      icon: FaClock,
      dark: true,
    },
  ]

  return (
    <section>
      <PageHeader
        title="System Logs"
        description="Review recent platform audit events and administrative actions."
        action={(
          <div className="flex flex-wrap gap-3">
            <button className={secondaryButtonClass} type="button" onClick={loadLogs} disabled={isLoading}>
              <FaArrowsRotate />
              {isLoading ? "Loading..." : "Refresh"}
            </button>
            <button className={secondaryButtonClass} type="button" onClick={exportLogs} disabled={displayedLogs.length === 0}>
              <FaDownload />
              Export
            </button>
          </div>
        )}
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, dark }) => (
          <article
            key={label}
            className={dark ? "rounded-2xl border border-violet-700 bg-violet-700 p-5 text-white shadow-sm shadow-violet-200" : `${cardClass} p-5`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className={dark ? "rounded-xl bg-white/15 p-2 text-white" : "rounded-xl bg-violet-50 p-2 text-violet-700"}>
                <Icon />
              </span>
              <span className={dark ? "text-xs font-bold uppercase tracking-[0.05em] text-violet-100" : "text-xs font-bold uppercase tracking-[0.05em] text-slate-500"}>
                {label}
              </span>
            </div>
            <strong className={dark ? "block text-xl font-bold leading-7 text-white" : "block text-3xl font-bold text-slate-900"}>
              {value}
            </strong>
          </article>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <label className="relative max-w-md flex-1">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className={`${inputClass} pl-10`}
              placeholder="Search by user, shop, action, or entity..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-3 md:ml-auto">
            <label className={secondaryButtonClass}>
              <FaFilter />
              <select
                className="bg-transparent text-sm font-semibold outline-none"
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
              >
                <option value="ALL">All Actions</option>
                {actionOptions.map((action) => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </label>
            <button className={secondaryButtonClass} type="button" onClick={exportLogs} disabled={displayedLogs.length === 0}>
              <FaDownload />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-violet-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Audit Log Entries</h3>
            <p className="mt-1 text-sm text-slate-500">
              {latestLog ? `Latest event: ${latestLog.action || "Unknown"} at ${formatDate(latestLog.createdAt, dateTimeFormat)}` : "Waiting for audit events."}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.05em] text-violet-800">
            <FaTerminal />
            {displayedLogs.length.toLocaleString()} rows
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Date</th>
                <th className={tableHeadCellClass}>Time</th>
                <th className={tableHeadCellClass}>User</th>
                <th className={tableHeadCellClass}>Shop</th>
                <th className={tableHeadCellClass}>Action</th>
                <th className={tableHeadCellClass}>Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-100">
              {isLoading ? (
                <TableEmpty colSpan="6">Loading system logs...</TableEmpty>
              ) : displayedLogs.map((log) => (
                <tr key={log._id} className="transition-colors hover:bg-violet-50/50">
                  <td className={tableCellClass}>
                    <span className="inline-flex items-center gap-2">
                      <FaCalendarDays className="text-violet-600" />
                      {formatDate(log.createdAt, dateFormat)}
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    <span className="inline-flex items-center gap-2 font-semibold text-slate-900">
                      <FaClock className="text-violet-600" />
                      {formatDate(log.createdAt, timeFormat)}
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    <div>
                      <p className="font-semibold text-slate-900">{log.user?.username || "System"}</p>
                      {log.user?.email && <p className="mt-1 text-xs text-slate-500">{log.user.email}</p>}
                    </div>
                  </td>
                  <td className={tableCellClass}>{log.shopId?.name || "Platform"}</td>
                  <td className={tableCellClass}>
                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.05em] text-violet-800">
                      <FaListCheck />
                      {log.action}
                    </span>
                  </td>
                  <td className={tableCellClass}>{log.entityType || "-"}</td>
                </tr>
              ))}
              {!isLoading && displayedLogs.length === 0 && <TableEmpty colSpan="6">No audit logs</TableEmpty>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default SystemLogs
