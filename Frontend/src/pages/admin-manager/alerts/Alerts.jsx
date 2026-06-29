import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import {
  FaArrowsRotate,
  FaBell,
  FaDownload,
  FaFilter,
  FaMagnifyingGlass,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6"
import { adminManagerService } from "../../../services/users/adminManager.service"
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

const severityClass = {
  CRITICAL: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50",
  WARNING: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50",
  SUCCESS: "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20",
  INFO: "bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/20",
}

const getAlertTypeLabel = (t) => ({
  LOGIN: t('login_alert'),
  FAILED_LOGIN: t('failed_login_alert'),
  LOW_STOCK: t('low_stock_alert'),
  CRITICAL_STOCK: t('critical_stock_alert'),
  OUT_OF_STOCK: t('out_of_stock_alert'),
  SUSPICIOUS_ACTIVITY: t('suspicious_activity_alert'),
})

function Alerts() {
  const { t } = useTranslation()
  const [alerts, setAlerts] = useState([])
  const [summary, setSummary] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const location = useLocation()
  const [highlightedAlertId, setHighlightedAlertId] = useState(null)
  const [selectedAlert, setSelectedAlert] = useState(null)

  const alertTypeLabel = useMemo(() => getAlertTypeLabel(t), [t])

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const alertId = queryParams.get("alertId")
    if (alertId) {
      setHighlightedAlertId(alertId)
      const timer = setTimeout(() => setHighlightedAlertId(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [location.search])

  useEffect(() => {
    if (highlightedAlertId && alerts.length > 0) {
      const el = document.getElementById(`alert-${highlightedAlertId}`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
      
      const found = alerts.find(a => a._id === highlightedAlertId)
      if (found) {
        setSelectedAlert(found)
      } else {
        setError(t('alert_not_found_or_already_removed'))
      }
    }
  }, [highlightedAlertId, alerts, t])

  const loadAlerts = useCallback((quiet = false) => {
    if (!quiet) setIsLoading(true)
    setError("")
    return adminManagerService.alerts()
      .then((res) => {
        const data = res.data?.result || res.data || {};
        setAlerts(data.alerts || []);
        setSummary(data.summary || {});
      })
      .catch((loadError) => {
        if (loadError?.response?.status !== 401) {
          setError(formatApiError(loadError) || t('unable_to_load_alerts'))
        }
      })
      .finally(() => {
        if (!quiet) setIsLoading(false)
      })
  }, [t])

  useEffect(() => {
    loadAlerts()
    const interval = setInterval(() => loadAlerts(true), 30000)
    const handleRefetch = () => loadAlerts(true)
    window.addEventListener("refetchAlerts", handleRefetch)
    return () => {
      clearInterval(interval)
      window.removeEventListener("refetchAlerts", handleRefetch)
    }
  }, [loadAlerts])

  const typeOptions = useMemo(() => (
    Array.from(new Set(alerts.map((alert) => alert.type).filter(Boolean))).sort()
  ), [alerts])

  const displayedAlerts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return alerts.filter((alert) => {
      let matchFilter = typeFilter === "ALL"
      if (!matchFilter) {
        if (typeFilter === "UNREAD") matchFilter = !alert.read && alert.status !== "resolved"
        else if (typeFilter === "READ") matchFilter = alert.read && alert.status !== "resolved"
        else if (typeFilter === "RESOLVED") matchFilter = alert.status === "resolved"
        else matchFilter = alert.type === typeFilter
      }

      return matchFilter && (!term
        || alert.title?.toLowerCase().includes(term)
        || alert.message?.toLowerCase().includes(term)
        || alert.shopId?.name?.toLowerCase().includes(term)
        || alert.userId?.username?.toLowerCase().includes(term)
        || alertTypeLabel[alert.type]?.toLowerCase().includes(term))
    })
  }, [alerts, search, typeFilter, alertTypeLabel])

  const exportAlerts = () => {
    downloadCsv(
      "admin-manager-alerts.csv",
      [
        { label: t('date'), value: (alert) => alert.createdAt ? formatDate(alert.createdAt, "DD/MMM/YYYY HH:mm") : "" },
        { label: t('type'), value: (alert) => alertTypeLabel[alert.type] || alert.type || "" },
        { label: t('severity'), value: (alert) => alert.severity || "INFO" },
        { label: t('shop'), value: (alert) => alert.shopId?.name || t('platform') },
        { label: t('user'), value: (alert) => alert.userId?.username || "-" },
        { label: t('message'), value: (alert) => alert.message || "" },
      ],
      displayedAlerts
    )
  }

  const unreadByType = useMemo(() => {
    const counts = {}
    alerts.forEach((alert) => {
      if (!alert.read && alert.status !== 'resolved') {
        counts[alert.type] = (counts[alert.type] || 0) + 1
      }
    })
    return counts
  }, [alerts])

  const summaryCards = [
    { label: t('login_alerts'), value: summary.loginAlerts || 0, unread: unreadByType.LOGIN || 0, type: "LOGIN" },
    { label: t('failed_login_alerts'), value: summary.failedLoginAlerts || 0, unread: unreadByType.FAILED_LOGIN || 0, type: "FAILED_LOGIN" },
    { label: t('low_stock_alerts'), value: summary.lowStockAlerts || 0, unread: unreadByType.LOW_STOCK || 0, type: "LOW_STOCK" },
    { label: t('critical_stock_alerts'), value: summary.criticalStockAlerts || 0, unread: unreadByType.CRITICAL_STOCK || 0, type: "CRITICAL_STOCK" },
    { label: t('out_of_stock_alerts'), value: summary.outOfStockAlerts || 0, unread: unreadByType.OUT_OF_STOCK || 0, type: "OUT_OF_STOCK" },
    { label: t('suspicious_activity_alerts'), value: summary.suspiciousActivityAlerts || 0, unread: unreadByType.SUSPICIOUS_ACTIVITY || 0, type: "SUSPICIOUS_ACTIVITY" },
  ]

  return (
    <section>
      <PageHeader
        title={t('alerts_title')}
        description={t('alerts_desc')}
        action={(
          <div className="flex flex-wrap gap-3">
            <button className={secondaryButtonClass} type="button" onClick={loadAlerts} disabled={isLoading}>
              <FaArrowsRotate />
              {isLoading ? t('loading') : t('refresh')}
            </button>
            <button className={secondaryButtonClass} type="button" onClick={exportAlerts} disabled={displayedAlerts.length === 0}>
              <FaDownload />
              {t('export')}
            </button>
            <button className={secondaryButtonClass} type="button" onClick={() => {
              adminManagerService.markAllAlertsAsRead().then(() => {
                loadAlerts(true);
              });
            }} disabled={alerts.every(a => a.read)}>
              {t('mark_all_read')}
            </button>
          </div>
        )}
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/50 p-4" onClick={() => setSelectedAlert(null)}>
          <div className={`${cardClass} w-full max-w-lg overflow-hidden flex flex-col`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#e5e7eb] dark:border-[#27272a] p-4">
              <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">{t('alert_details')}</h3>
              <button type="button" onClick={() => setSelectedAlert(null)} className="text-[#64748b] hover:text-[#020617] dark:hover:text-[#f8fafc]">
                <FaXmark size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">{t('alert_type')}</span>
                <p className="font-semibold text-[#020617] dark:text-[#f8fafc]">{alertTypeLabel[selectedAlert.type] || selectedAlert.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">{t('severity')}</span>
                  <p><span className={`${severityClass[selectedAlert.severity] || severityClass.INFO} inline-flex rounded-full px-2 py-0.5 text-xs font-bold uppercase`}>{selectedAlert.severity || "INFO"}</span></p>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">{t('status')}</span>
                  <p>
                    {selectedAlert.status === 'resolved' ? (
                      <span className="text-[#10b981] font-semibold">{t('resolved')}</span>
                    ) : selectedAlert.read ? (
                      <span className="text-[#64748b] font-semibold">{t('read')}</span>
                    ) : (
                      <span className="text-[#06b6d4] font-bold">{t('unread')}</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">{t('time')}</span>
                  <p className="text-sm font-semibold text-[#020617] dark:text-[#f8fafc]">{selectedAlert.createdAt ? formatDate(selectedAlert.createdAt, "DD/MMM/YYYY HH:mm") : "-"}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">{t('shop')}</span>
                  <p className="text-sm font-semibold text-[#020617] dark:text-[#f8fafc]">{selectedAlert.shopId?.name || t('platform')}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">{t('user')}</span>
                  <p className="text-sm font-semibold text-[#020617] dark:text-[#f8fafc]">{selectedAlert.userId?.username || "-"}</p>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">{t('message')}</span>
                <p className="text-[#020617] dark:text-[#f8fafc] p-3 bg-[#f8fafc] dark:bg-[#09090b] rounded-lg mt-1">{selectedAlert.message}</p>
              </div>
              {selectedAlert.metadata && Object.keys(selectedAlert.metadata).length > 0 && (
                <div>
                  <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">{t('metadata')}</span>
                  <pre className="text-xs text-[#020617] dark:text-[#f8fafc] p-3 bg-[#f8fafc] dark:bg-[#09090b] rounded-lg mt-1 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="flex justify-end border-t border-[#e5e7eb] dark:border-[#27272a] p-4 bg-[#f8fafc] dark:bg-[#09090b]">
              <button className={secondaryButtonClass} type="button" onClick={() => setSelectedAlert(null)}>{t('close')}</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => setTypeFilter(card.type)}
            className={`${cardClass} p-5 text-left transition hover:border-[#06b6d4]/50 hover:bg-[#f8fafc] dark:hover:bg-[#09090b]`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="rounded-xl bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 p-2 text-[#06b6d4]">
                <FaBell />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.05em] text-[#64748b] dark:text-[#a1a1aa]">{card.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <strong className="block text-3xl font-bold text-[#020617] dark:text-[#f8fafc]">{Number(card.value || 0).toLocaleString()}</strong>
              {card.unread > 0 && (
                <span className="text-xs font-bold text-[#06b6d4] bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 px-2 py-1 rounded-lg">{t('unread_count')} {card.unread}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mb-6 rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <label className="relative max-w-md flex-1">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#a1a1aa]" />
            <input
              className={`${inputClass} pl-10`}
              placeholder={t('search_alerts_placeholder')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className={secondaryButtonClass}>
            <FaFilter />
            <select
              className="bg-transparent text-sm font-semibold outline-none dark:bg-[#111113] dark:text-[#f8fafc]"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="ALL">{t('all_alerts')}</option>
              <optgroup label={t('by_type')}>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>{alertTypeLabel[type] || type}</option>
                ))}
              </optgroup>
              <optgroup label={t('by_status')}>
                <option value="UNREAD">{t('unread')}</option>
                <option value="READ">{t('read')}</option>
                <option value="RESOLVED">{t('resolved')}</option>
              </optgroup>
            </select>
          </label>
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>{t('time')}</th>
                <th className={tableHeadCellClass}>{t('alerts_title')}</th>
                <th className={tableHeadCellClass}>{t('severity')}</th>
                <th className={tableHeadCellClass}>{t('shop')}</th>
                <th className={tableHeadCellClass}>{t('user')}</th>
                <th className={tableHeadCellClass}>{t('message')}</th>
                <th className={tableHeadCellClass}>{t('status')}</th>
                <th className={tableHeadCellClass}>{t('action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {isLoading ? (
                <TableEmpty colSpan="8">{t('loading_alerts')}</TableEmpty>
              ) : displayedAlerts.map((alert) => (
                <tr 
                  key={alert._id} 
                  id={`alert-${alert._id}`}
                  className={`transition-colors ${highlightedAlertId === alert._id ? 'bg-[#06b6d4]/10 dark:bg-[#06b6d4]/20 animate-pulse' : 'hover:bg-[#f8fafc] dark:hover:bg-[#09090b]'}`}
                >
                  <td className={tableCellClass}>
                    {alert.createdAt ? formatDate(alert.createdAt, "DD/MMM/YYYY HH:mm") : "-"}
                  </td>
                  <td className={`${tableCellClass} font-semibold text-[#020617] dark:text-[#f8fafc]`}>
                    <span className="inline-flex items-center gap-2">
                      <FaTriangleExclamation className="text-[#06b6d4]" />
                      {alertTypeLabel[alert.type] || alert.title || "-"}
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    <span className={`${severityClass[alert.severity] || severityClass.INFO} inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.05em]`}>
                      {alert.severity || "INFO"}
                    </span>
                  </td>
                  <td className={tableCellClass}>{alert.shopId?.name || t('platform')}</td>
                  <td className={tableCellClass}>{alert.userId?.username || "-"}</td>
                  <td className={`${tableCellClass} max-w-md whitespace-normal leading-6`}>{alert.message || "-"}</td>
                  <td className={tableCellClass}>
                    {alert.status === 'resolved' ? (
                      <span className="text-xs font-semibold text-[#10b981] dark:text-[#10b981]">{t('resolved')}</span>
                    ) : alert.read ? (
                      <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">{t('read')}</span>
                    ) : (
                      <span className="text-xs font-bold text-[#06b6d4]">{t('unread')}</span>
                    )}
                  </td>
                  <td className={tableCellClass}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAlert(alert)}
                        title="View alert details"
                        className="text-xs font-semibold text-[#64748b] hover:text-[#020617] dark:hover:text-[#f8fafc]"
                      >
                        {t('view')}
                      </button>
                      
                      {!alert.read && alert.status !== 'resolved' ? (
                        <button
                          type="button"
                          onClick={() => {
                            adminManagerService.markAlertAsRead(alert._id).then(() => {
                              loadAlerts(true);
                            });
                          }}
                          className="text-xs font-semibold text-[#06b6d4] hover:underline"
                        >
                          {t('mark_read')}
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-[#64748b] opacity-50 cursor-not-allowed">{t('read')}</span>
                      )}

                      {alert.status !== 'resolved' ? (
                        <button
                          type="button"
                          onClick={() => {
                            adminManagerService.resolveAlert(alert._id).then(() => {
                              loadAlerts(true);
                            });
                          }}
                          className="text-xs font-semibold text-[#10b981] hover:underline"
                        >
                          {t('resolve')}
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-[#64748b] opacity-50 cursor-not-allowed">{t('resolved')}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && displayedAlerts.length === 0 && (
                <TableEmpty colSpan="8">
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="mb-2 text-lg font-semibold text-[#020617] dark:text-[#f8fafc]">
                      {alerts.length === 0 ? t('no_alerts_found') : t('no_alerts_found_filter')}
                    </p>
                    {alerts.length === 0 && (
                      <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">{t('alerts_empty_desc')}</p>
                    )}
                  </div>
                </TableEmpty>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Alerts
