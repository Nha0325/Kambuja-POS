import { useCallback, useEffect, useState } from "react"
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
import api from "../../../utils/config/api"
import { downloadCsv } from "../../../utils/helpers/downloadCsv"
import { formatApiError } from "../../../utils/formatters/formatApiError"
import formatDate from "../../../utils/formatters/formatDate"
import {
  cardClass,
  inputClass,
  secondaryButtonClass,
  tableCellClass,
  tableHeadCellClass,
  tableHeadClass,
} from "../adminManagerUi"
import { PageHeader, TableEmpty } from "../../../components/admin/AdminManagerUi"

const dateFormat = "DD/MMM/YYYY"
const timeFormat = "HH:mm"
const dateTimeFormat = `${dateFormat} ${timeFormat}`

function SystemLogs() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ total: 0, actionTypesCount: 0, latestTime: null })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("ALL")

  const loadLogs = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const queryParams = new URLSearchParams()
      if (search) queryParams.append("search", search)
      if (actionFilter !== "ALL") queryParams.append("action", actionFilter)

      const [logsRes, statsRes] = await Promise.all([
        api.get(`/system-logs?${queryParams.toString()}`),
        api.get(`/system-logs/stats`)
      ])

      const logsData = logsRes.data
      const statsData = statsRes.data

      setLogs(logsData.data || [])
      setStats(statsData.data || { total: 0, actionTypesCount: 0, latestTime: null })
    } catch (loadError) {
      if (loadError?.response?.status !== 401) {
        setError(formatApiError(loadError) || "Failed to load system logs")
      }
    } finally {
      setIsLoading(false)
    }
  }, [search, actionFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLogs()
    }, 300)
    return () => clearTimeout(timer)
  }, [loadLogs])

  const exportLogs = () => {
    downloadCsv(
      "admin-manager-system-logs.csv",
      [
        { label: "Date", value: (log) => formatDate(log.createdAt, dateFormat) },
        { label: "Time", value: (log) => formatDate(log.createdAt, timeFormat) },
        { label: "User", value: (log) => log.userName || "System" },
        { label: "User Email", value: (log) => log.userEmail || "" },
        { label: "Shop", value: (log) => log.shopName || "Platform" },
        { label: "Action", value: (log) => log.action || "" },
        { label: "Entity", value: (log) => log.entity || "" },
        { label: "Message", value: (log) => log.message || "" },
        { label: "IP Address", value: (log) => log.ipAddress || "" }
      ],
      logs
    )
  }

  const latestLog = logs[0]
  const summaryCards = [
    { label: "Audit Events", value: stats.total.toLocaleString(), icon: FaListCheck },
    { label: "Matching Results", value: logs.length.toLocaleString(), icon: FaFilter },
    { label: "Action Types", value: stats.actionTypesCount.toLocaleString(), icon: FaLayerGroup },
    {
      label: "Latest Time",
      value: stats.latestTime ? formatDate(stats.latestTime, dateTimeFormat) : "No audit log yet",
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
            <button className={secondaryButtonClass} type="button" onClick={exportLogs} disabled={logs.length === 0}>
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
            className={dark ? "rounded-2xl border border-[#7033ff] bg-[#7033ff] p-5 text-white shadow-sm" : `${cardClass} p-5`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className={dark ? "rounded-xl bg-white/15 p-2 text-white" : "rounded-xl bg-[#7033ff]/10 dark:bg-[#7033ff]/20 p-2 text-[#7033ff]"}>
                <Icon />
              </span>
              <span className={dark ? "text-xs font-bold uppercase tracking-[0.05em] text-white/80" : "text-xs font-bold uppercase tracking-[0.05em] text-[#64748b] dark:text-[#a1a1aa]"}>
                {label}
              </span>
            </div>
            <strong className={dark ? "block text-xl font-bold leading-7 text-white" : "block text-3xl font-bold text-[#020617] dark:text-[#f8fafc]"}>
              {value}
            </strong>
          </article>
        ))}
      </div>

      <div className="mb-6 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <label className="relative max-w-md flex-1">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#a1a1aa]" />
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
                className="bg-transparent text-sm font-semibold outline-none dark:text-[#f8fafc]"
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
              >
                <option value="ALL">All Actions</option>
                {[ "LOGIN", "LOGIN_FAILED", "STOCK_IN", "STOCK_OUT", "CREATE", "UPDATE", "DELETE", "SALE_CREATE", "PURCHASE_CREATE", "RESTORE" ].map((action) => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </label>
            <button className={secondaryButtonClass} type="button" onClick={exportLogs} disabled={logs.length === 0}>
              <FaDownload />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden flex flex-col`}>
        <div className="flex flex-col gap-3 border-b border-[#e5e7eb] dark:border-[#27272a] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#020617] dark:text-[#f8fafc]">Audit Log Entries</h3>
            <p className="mt-1 text-sm text-[#64748b] dark:text-[#a1a1aa]">
              {latestLog ? `Latest event: ${latestLog.action || "Unknown"} at ${formatDate(latestLog.createdAt, dateTimeFormat)}` : "Waiting for audit events."}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#7033ff]/20 bg-[#7033ff]/10 dark:bg-[#7033ff]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.05em] text-[#7033ff]">
            <FaTerminal />
            {logs.length.toLocaleString()} rows
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
                <th className={tableHeadCellClass}>Message</th>
                <th className={tableHeadCellClass}>IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {isLoading ? (
                <TableEmpty colSpan="8">Loading system logs...</TableEmpty>
              ) : logs.map((log) => (
                <tr key={log._id} className="transition-colors hover:bg-[#f8fafc] dark:hover:bg-[#09090b]">
                  <td className={tableCellClass}>
                    <span className="inline-flex items-center gap-2">
                      <FaCalendarDays className="text-[#7033ff]" />
                      {formatDate(log.createdAt, dateFormat)}
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    <span className="inline-flex items-center gap-2 font-semibold text-[#020617] dark:text-[#f8fafc]">
                      <FaClock className="text-[#7033ff]" />
                      {formatDate(log.createdAt, timeFormat)}
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    <div>
                      <p className="font-semibold text-[#020617] dark:text-[#f8fafc]">{log.userName || "System"}</p>
                      {log.userEmail && <p className="mt-1 text-xs text-[#64748b] dark:text-[#a1a1aa]">{log.userEmail}</p>}
                    </div>
                  </td>
                  <td className={tableCellClass}>{log.shopName || "Platform"}</td>
                  <td className={tableCellClass}>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#7033ff]/20 bg-[#7033ff]/10 dark:bg-[#7033ff]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.05em] text-[#7033ff]">
                      <FaListCheck />
                      {log.action}
                    </span>
                  </td>
                  <td className={tableCellClass}>{log.entity || "-"}</td>
                  <td className={tableCellClass}>{log.message || "-"}</td>
                  <td className={tableCellClass}>{log.ipAddress || "-"}</td>
                </tr>
              ))}
              {!isLoading && logs.length === 0 && <TableEmpty colSpan="8">No system logs found</TableEmpty>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default SystemLogs
