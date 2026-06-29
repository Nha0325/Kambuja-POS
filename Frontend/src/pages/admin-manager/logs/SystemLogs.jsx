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
import { useTranslation } from "react-i18next"

const dateFormat = "DD/MMM/YYYY"
const timeFormat = "HH:mm"
const dateTimeFormat = `${dateFormat} ${timeFormat}`

function SystemLogs() {
  const { t } = useTranslation()
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
        setError(formatApiError(loadError) || t('failed_to_load_system_logs'))
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
        { label: t('date'), value: (log) => formatDate(log.createdAt, dateFormat) },
        { label: t('time'), value: (log) => formatDate(log.createdAt, timeFormat) },
        { label: t('user'), value: (log) => log.userName || t('system_user') },
        { label: t('user_email'), value: (log) => log.userEmail || "" },
        { label: t('shop'), value: (log) => log.shopName || t('platform') },
        { label: t('action'), value: (log) => log.action || "" },
        { label: t('entity'), value: (log) => log.entity || "" },
        { label: t('message'), value: (log) => log.message || "" },
        { label: t('ip_address'), value: (log) => log.ipAddress || "" }
      ],
      logs
    )
  }

  const latestLog = logs[0]
  const summaryCards = [
    { label: t('audit_events'), value: stats.total.toLocaleString(), icon: FaListCheck },
    { label: t('matching_results'), value: logs.length.toLocaleString(), icon: FaFilter },
    { label: t('action_types'), value: stats.actionTypesCount.toLocaleString(), icon: FaLayerGroup },
    {
      label: t('latest_time'),
      value: stats.latestTime ? formatDate(stats.latestTime, dateTimeFormat) : t('no_audit_log_yet'),
      icon: FaClock,
      dark: true,
    },
  ]

  return (
    <section>
      <PageHeader
        title={t('system_logs')}
        description={t('system_logs_desc')}
        action={(
          <div className="flex flex-wrap gap-3">
            <button className={secondaryButtonClass} type="button" onClick={loadLogs} disabled={isLoading}>
              <FaArrowsRotate />
              {isLoading ? t('loading') : t('refresh')}
            </button>
            <button className={secondaryButtonClass} type="button" onClick={exportLogs} disabled={logs.length === 0}>
              <FaDownload />
              {t('export')}
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
            className={dark ? "rounded-2xl border border-[#06b6d4] bg-[#06b6d4] p-5 text-white shadow-sm" : `${cardClass} p-5`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className={dark ? "rounded-xl bg-white/15 p-2 text-white" : "rounded-xl bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 p-2 text-[#06b6d4]"}>
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
              placeholder={t('search_logs_placeholder')}
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
                <option value="ALL">{t('all_actions')}</option>
                {[ "LOGIN", "LOGIN_FAILED", "STOCK_IN", "STOCK_OUT", "CREATE", "UPDATE", "DELETE", "SALE_CREATE", "PURCHASE_CREATE", "RESTORE" ].map((action) => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </label>
            <button className={secondaryButtonClass} type="button" onClick={exportLogs} disabled={logs.length === 0}>
              <FaDownload />
              {t('export')}
            </button>
          </div>
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden flex flex-col`}>
        <div className="flex flex-col gap-3 border-b border-[#e5e7eb] dark:border-[#27272a] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#020617] dark:text-[#f8fafc]">{t('audit_log_entries')}</h3>
            <p className="mt-1 text-sm text-[#64748b] dark:text-[#a1a1aa]">
              {latestLog ? `${t('latest_event')} ${latestLog.action || t('unknown')} at ${formatDate(latestLog.createdAt, dateTimeFormat)}` : t('waiting_for_audit_events')}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#06b6d4]/20 bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.05em] text-[#06b6d4]">
            <FaTerminal />
            {logs.length.toLocaleString()} {t('rows')}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>{t('date')}</th>
                <th className={tableHeadCellClass}>{t('time')}</th>
                <th className={tableHeadCellClass}>{t('user')}</th>
                <th className={tableHeadCellClass}>{t('shop')}</th>
                <th className={tableHeadCellClass}>{t('action')}</th>
                <th className={tableHeadCellClass}>{t('entity')}</th>
                <th className={tableHeadCellClass}>{t('message')}</th>
                <th className={tableHeadCellClass}>{t('ip_address')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {isLoading ? (
                <TableEmpty colSpan="8">{t('loading_system_logs')}</TableEmpty>
              ) : logs.map((log) => (
                <tr key={log._id} className="transition-colors hover:bg-[#f8fafc] dark:hover:bg-[#09090b]">
                  <td className={tableCellClass}>
                    <span className="inline-flex items-center gap-2">
                      <FaCalendarDays className="text-[#06b6d4]" />
                      {formatDate(log.createdAt, dateFormat)}
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    <span className="inline-flex items-center gap-2 font-semibold text-[#020617] dark:text-[#f8fafc]">
                      <FaClock className="text-[#06b6d4]" />
                      {formatDate(log.createdAt, timeFormat)}
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    <div>
                      <p className="font-semibold text-[#020617] dark:text-[#f8fafc]">{log.userName || t('system_user')}</p>
                      {log.userEmail && <p className="mt-1 text-xs text-[#64748b] dark:text-[#a1a1aa]">{log.userEmail}</p>}
                    </div>
                  </td>
                  <td className={tableCellClass}>{log.shopName || t('platform')}</td>
                  <td className={tableCellClass}>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#06b6d4]/20 bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.05em] text-[#06b6d4]">
                      <FaListCheck />
                      {log.action}
                    </span>
                  </td>
                  <td className={tableCellClass}>{log.entity || "-"}</td>
                  <td className={tableCellClass}>{log.message || "-"}</td>
                  <td className={tableCellClass}>{log.ipAddress || "-"}</td>
                </tr>
              ))}
              {!isLoading && logs.length === 0 && <TableEmpty colSpan="8">{t('no_system_logs_found')}</TableEmpty>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default SystemLogs
