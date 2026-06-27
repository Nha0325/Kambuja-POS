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

const severityClass = {
  CRITICAL: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50",
  WARNING: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50",
  SUCCESS: "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20",
  INFO: "bg-[#7033ff]/10 dark:bg-[#7033ff]/20 text-[#7033ff] border border-[#7033ff]/20",
}

const alertTypeLabel = {
  LOGIN: "Login Alert",
  FAILED_LOGIN: "Failed Login Alert",
  LOW_STOCK: "Low Stock Alert",
  CRITICAL_STOCK: "Critical Stock Alert",
  OUT_OF_STOCK: "Out of Stock Alert",
  SUSPICIOUS_ACTIVITY: "Suspicious Activity Alert",
}

function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [summary, setSummary] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const location = useLocation()
  const [highlightedAlertId, setHighlightedAlertId] = useState(null)
  const [selectedAlert, setSelectedAlert] = useState(null)

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
        setError("Alert not found or already removed.")
      }
    }
  }, [highlightedAlertId, alerts])

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
          setError(formatApiError(loadError) || "Unable to load alerts")
        }
      })
      .finally(() => {
        if (!quiet) setIsLoading(false)
      })
  }, [])

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
  }, [alerts, search, typeFilter])

  const exportAlerts = () => {
    downloadCsv(
      "admin-manager-alerts.csv",
      [
        { label: "Date", value: (alert) => alert.createdAt ? formatDate(alert.createdAt, "DD/MMM/YYYY HH:mm") : "" },
        { label: "Type", value: (alert) => alertTypeLabel[alert.type] || alert.type || "" },
        { label: "Severity", value: (alert) => alert.severity || "INFO" },
        { label: "Shop", value: (alert) => alert.shopId?.name || "Platform" },
        { label: "User", value: (alert) => alert.userId?.username || "-" },
        { label: "Message", value: (alert) => alert.message || "" },
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
    { label: "Login Alerts", value: summary.loginAlerts || 0, unread: unreadByType.LOGIN || 0, type: "LOGIN" },
    { label: "Failed Login Alerts", value: summary.failedLoginAlerts || 0, unread: unreadByType.FAILED_LOGIN || 0, type: "FAILED_LOGIN" },
    { label: "Low Stock Alerts", value: summary.lowStockAlerts || 0, unread: unreadByType.LOW_STOCK || 0, type: "LOW_STOCK" },
    { label: "Critical Stock Alerts", value: summary.criticalStockAlerts || 0, unread: unreadByType.CRITICAL_STOCK || 0, type: "CRITICAL_STOCK" },
    { label: "Out of Stock Alerts", value: summary.outOfStockAlerts || 0, unread: unreadByType.OUT_OF_STOCK || 0, type: "OUT_OF_STOCK" },
    { label: "Suspicious Activity Alerts", value: summary.suspiciousActivityAlerts || 0, unread: unreadByType.SUSPICIOUS_ACTIVITY || 0, type: "SUSPICIOUS_ACTIVITY" },
  ]

  return (
    <section>
      <PageHeader
        title="Alerts"
        description="Review login, failed login, stock, and suspicious activity signals across shops."
        action={(
          <div className="flex flex-wrap gap-3">
            <button className={secondaryButtonClass} type="button" onClick={loadAlerts} disabled={isLoading}>
              <FaArrowsRotate />
              {isLoading ? "Loading..." : "Refresh"}
            </button>
            <button className={secondaryButtonClass} type="button" onClick={exportAlerts} disabled={displayedAlerts.length === 0}>
              <FaDownload />
              Export
            </button>
            <button className={secondaryButtonClass} type="button" onClick={() => {
              adminManagerService.markAllAlertsAsRead().then(() => {
                loadAlerts(true);
              });
            }} disabled={alerts.every(a => a.read)}>
              Mark All Read
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
              <h3 className="text-lg font-bold text-[#020617] dark:text-[#f8fafc]">Alert Details</h3>
              <button type="button" onClick={() => setSelectedAlert(null)} className="text-[#64748b] hover:text-[#020617] dark:hover:text-[#f8fafc]">
                <FaXmark size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">Alert Type</span>
                <p className="font-semibold text-[#020617] dark:text-[#f8fafc]">{alertTypeLabel[selectedAlert.type] || selectedAlert.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">Severity</span>
                  <p><span className={`${severityClass[selectedAlert.severity] || severityClass.INFO} inline-flex rounded-full px-2 py-0.5 text-xs font-bold uppercase`}>{selectedAlert.severity || "INFO"}</span></p>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">Status</span>
                  <p>
                    {selectedAlert.status === 'resolved' ? (
                      <span className="text-[#10b981] font-semibold">Resolved</span>
                    ) : selectedAlert.read ? (
                      <span className="text-[#64748b] font-semibold">Read</span>
                    ) : (
                      <span className="text-[#7033ff] font-bold">Unread</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">Time</span>
                  <p className="text-sm font-semibold text-[#020617] dark:text-[#f8fafc]">{selectedAlert.createdAt ? formatDate(selectedAlert.createdAt, "DD/MMM/YYYY HH:mm") : "-"}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">Shop</span>
                  <p className="text-sm font-semibold text-[#020617] dark:text-[#f8fafc]">{selectedAlert.shopId?.name || "Platform"}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">User</span>
                  <p className="text-sm font-semibold text-[#020617] dark:text-[#f8fafc]">{selectedAlert.userId?.username || "-"}</p>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">Message</span>
                <p className="text-[#020617] dark:text-[#f8fafc] p-3 bg-[#f8fafc] dark:bg-[#09090b] rounded-lg mt-1">{selectedAlert.message}</p>
              </div>
              {selectedAlert.metadata && Object.keys(selectedAlert.metadata).length > 0 && (
                <div>
                  <span className="text-xs font-bold text-[#64748b] dark:text-[#a1a1aa] uppercase">Metadata</span>
                  <pre className="text-xs text-[#020617] dark:text-[#f8fafc] p-3 bg-[#f8fafc] dark:bg-[#09090b] rounded-lg mt-1 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="flex justify-end border-t border-[#e5e7eb] dark:border-[#27272a] p-4 bg-[#f8fafc] dark:bg-[#09090b]">
              <button className={secondaryButtonClass} type="button" onClick={() => setSelectedAlert(null)}>Close</button>
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
            className={`${cardClass} p-5 text-left transition hover:border-[#7033ff]/50 hover:bg-[#f8fafc] dark:hover:bg-[#09090b]`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="rounded-xl bg-[#7033ff]/10 dark:bg-[#7033ff]/20 p-2 text-[#7033ff]">
                <FaBell />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.05em] text-[#64748b] dark:text-[#a1a1aa]">{card.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <strong className="block text-3xl font-bold text-[#020617] dark:text-[#f8fafc]">{Number(card.value || 0).toLocaleString()}</strong>
              {card.unread > 0 && (
                <span className="text-xs font-bold text-[#7033ff] bg-[#7033ff]/10 dark:bg-[#7033ff]/20 px-2 py-1 rounded-lg">Unread: {card.unread}</span>
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
              placeholder="Search by alert, shop, user, or message..."
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
              <option value="ALL">All Alerts</option>
              <optgroup label="By Type">
                {typeOptions.map((type) => (
                  <option key={type} value={type}>{alertTypeLabel[type] || type}</option>
                ))}
              </optgroup>
              <optgroup label="By Status">
                <option value="UNREAD">Unread</option>
                <option value="READ">Read</option>
                <option value="RESOLVED">Resolved</option>
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
                <th className={tableHeadCellClass}>Time</th>
                <th className={tableHeadCellClass}>Alert</th>
                <th className={tableHeadCellClass}>Severity</th>
                <th className={tableHeadCellClass}>Shop</th>
                <th className={tableHeadCellClass}>User</th>
                <th className={tableHeadCellClass}>Message</th>
                <th className={tableHeadCellClass}>Status</th>
                <th className={tableHeadCellClass}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#27272a]">
              {isLoading ? (
                <TableEmpty colSpan="8">Loading alerts...</TableEmpty>
              ) : displayedAlerts.map((alert) => (
                <tr 
                  key={alert._id} 
                  id={`alert-${alert._id}`}
                  className={`transition-colors ${highlightedAlertId === alert._id ? 'bg-[#7033ff]/10 dark:bg-[#7033ff]/20 animate-pulse' : 'hover:bg-[#f8fafc] dark:hover:bg-[#09090b]'}`}
                >
                  <td className={tableCellClass}>
                    {alert.createdAt ? formatDate(alert.createdAt, "DD/MMM/YYYY HH:mm") : "-"}
                  </td>
                  <td className={`${tableCellClass} font-semibold text-[#020617] dark:text-[#f8fafc]`}>
                    <span className="inline-flex items-center gap-2">
                      <FaTriangleExclamation className="text-[#7033ff]" />
                      {alertTypeLabel[alert.type] || alert.title || "-"}
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    <span className={`${severityClass[alert.severity] || severityClass.INFO} inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.05em]`}>
                      {alert.severity || "INFO"}
                    </span>
                  </td>
                  <td className={tableCellClass}>{alert.shopId?.name || "Platform"}</td>
                  <td className={tableCellClass}>{alert.userId?.username || "-"}</td>
                  <td className={`${tableCellClass} max-w-md whitespace-normal leading-6`}>{alert.message || "-"}</td>
                  <td className={tableCellClass}>
                    {alert.status === 'resolved' ? (
                      <span className="text-xs font-semibold text-[#10b981] dark:text-[#10b981]">Resolved</span>
                    ) : alert.read ? (
                      <span className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">Read</span>
                    ) : (
                      <span className="text-xs font-bold text-[#7033ff]">Unread</span>
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
                        View
                      </button>
                      
                      {!alert.read && alert.status !== 'resolved' ? (
                        <button
                          type="button"
                          onClick={() => {
                            adminManagerService.markAlertAsRead(alert._id).then(() => {
                              loadAlerts(true);
                            });
                          }}
                          className="text-xs font-semibold text-[#7033ff] hover:underline"
                        >
                          Mark Read
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-[#64748b] opacity-50 cursor-not-allowed">Read</span>
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
                          Resolve
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-[#64748b] opacity-50 cursor-not-allowed">Resolved</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && displayedAlerts.length === 0 && (
                <TableEmpty colSpan="8">
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="mb-2 text-lg font-semibold text-[#020617] dark:text-[#f8fafc]">
                      {alerts.length === 0 ? "No alerts found." : "No alerts found for this filter."}
                    </p>
                    {alerts.length === 0 && (
                      <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">Login events, failed login attempts, stock warnings, subscription warnings, and admin activity will appear here.</p>
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
