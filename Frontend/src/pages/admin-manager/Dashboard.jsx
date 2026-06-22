import { useCallback, useEffect, useState } from "react"
import {
  FaBuilding,
  FaChartColumn,
  FaGaugeHigh,
  FaListCheck,
  FaUserShield,
} from "react-icons/fa6"
import { adminManagerService } from "../../services/adminManager.service"
import { downloadCsv } from "../../utils/downloadCsv"
import { formatApiError } from "../../utils/formatApiError"
import formatDate from "../../utils/formatDate"
import {
  cardClass,
  formatRiel,
  getInitials,
  pageHeaderDescriptionClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./adminManagerUi"
import { PageHeader } from "./adminManagerComponents"

const metrics = [
  { key: "totalShops", label: "Total Shops", icon: FaBuilding },
  { key: "totalAdmins", label: "Platform Admins", icon: FaUserShield },
  { key: "totalCashiers", label: "Active Cashiers", icon: FaListCheck },
  { key: "totalSales", label: "Total Sales", icon: FaChartColumn },
]

function Dashboard() {
  const [data, setData] = useState({})
  const [reports, setReports] = useState([])
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadDashboard = useCallback(() => {
    let isMounted = true

    setIsLoading(true)
    setError("")

    Promise.all([
      adminManagerService.dashboard(),
      adminManagerService.reports(),
      adminManagerService.auditLogs(),
    ])
      .then(([dashboardResponse, reportsResponse, logsResponse]) => {
        if (!isMounted) return
        setData(dashboardResponse.data.result || {})
        setReports(reportsResponse.data.result || [])
        setLogs(logsResponse.data.result || [])
        setLastUpdated(new Date())
      })
      .catch((loadError) => {
        if (isMounted && loadError?.response?.status !== 401) {
          setError(formatApiError(loadError) || "Unable to load dashboard")
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => loadDashboard(), [loadDashboard])

  const exportDashboard = () => {
    downloadCsv(
      "admin-manager-dashboard.csv",
      [
        { label: "Metric", value: (row) => row.label },
        { label: "Value", value: (row) => row.value },
      ],
      [
        { label: "Total Shops", value: data.totalShops || 0 },
        { label: "Platform Admins", value: data.totalAdmins || 0 },
        { label: "Active Cashiers", value: data.totalCashiers || 0 },
        { label: "Total Sales", value: data.totalSales || 0 },
        { label: "Total Revenue", value: data.totalRevenue || 0 },
      ]
    )
  }

  const topReports = reports.slice(0, 3)
  const maxRevenue = Math.max(...topReports.map((row) => Number(row.totalRevenue || 0)), 1)
  const recentLogs = logs.slice(0, 3)

  return (
    <section>
      <PageHeader
        title="Platform Dashboard"
        description="Real-time performance across the Kambuja shop management ecosystem."
        action={(
          <div className="flex flex-wrap gap-3">
            <button className={secondaryButtonClass} type="button" onClick={loadDashboard} disabled={isLoading}>
              {isLoading ? "Loading..." : "Refresh"}
            </button>
            <button className={primaryButtonClass} type="button" onClick={exportDashboard} disabled={isLoading}>
              Export View
            </button>
          </div>
        )}
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ key, label, icon: Icon }) => (
          <article key={key} className={`${cardClass} p-6 transition-transform active:scale-[0.98]`}>
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-xl bg-violet-50 p-2 text-violet-700">
                <Icon />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.05em] text-slate-500">
                {isLoading ? "Loading" : "Live"}
              </span>
            </div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">{label}</p>
            <strong className="block text-3xl font-bold text-slate-900">
              {Number(data[key] || 0).toLocaleString()}
            </strong>
          </article>
        ))}
      </div>

      <section className={`${cardClass} mt-6 overflow-hidden lg:flex`}>
        <div className="flex-1 p-6 md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Platform Revenue</h3>
              <p className={pageHeaderDescriptionClass}>Aggregate processing volume from the dashboard endpoint.</p>
            </div>
            <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800">
              {formatRiel(data.totalRevenue)}
            </div>
          </div>

          <div className="space-y-4">
            {topReports.length > 0 ? topReports.map((row) => {
              const width = `${Math.max((Number(row.totalRevenue || 0) / maxRevenue) * 100, 4)}%`
              return (
                <div key={row._id || row.shop?._id || "unassigned"} className="space-y-2">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-900">{row.shop?.name || "Unassigned"}</span>
                    <span className="text-slate-600">{formatRiel(row.totalRevenue)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-violet-100">
                    <div className="h-full rounded-full bg-violet-600" style={{ width }} />
                  </div>
                </div>
              )
            }) : (
              <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-6 text-sm text-slate-500">
                No shop revenue rows available.
              </div>
            )}
          </div>
        </div>

        <aside className="w-full border-t border-violet-100 bg-violet-50/60 p-6 md:p-8 lg:w-80 lg:border-l lg:border-t-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Revenue Summary</p>
          <h4 className="text-2xl font-bold text-slate-900">{formatRiel(data.totalRevenue)}</h4>
          <div className="mt-5 rounded-xl border border-violet-100 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FaGaugeHigh />
              Dashboard endpoint
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {lastUpdated ? `Last refreshed ${formatDate(lastUpdated, "DD/MMM/YYYY HH:mm")}` : "Waiting for live dashboard data."}
            </p>
          </div>
        </aside>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className={`${cardClass} p-6 md:p-8 lg:col-span-2`}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-base font-semibold text-slate-900">Recent Platform Activity</h3>
            <span className="text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Latest logs</span>
          </div>
          <div className="space-y-4">
            {recentLogs.length > 0 ? recentLogs.map((log) => (
              <article key={log._id} className="flex items-start gap-4 rounded-xl border border-transparent p-4 transition-colors hover:border-violet-200 hover:bg-violet-50/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                  <FaListCheck />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-800">
                    <span className="font-bold">{log.action}</span> on {log.entityType || "record"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(log.createdAt)} • {log.user?.username || "System"} • {log.shopId?.name || "Platform"}
                  </p>
                </div>
              </article>
            )) : (
              <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-6 text-sm text-slate-500">
                No audit logs available.
              </div>
            )}
          </div>
        </section>

        <section className={`${cardClass} p-6 md:p-8`}>
          <h3 className="mb-6 text-base font-semibold text-slate-900">Top Performing Shops</h3>
          <div className="space-y-6">
            {topReports.length > 0 ? topReports.map((row) => {
              const width = `${Math.max((Number(row.totalRevenue || 0) / maxRevenue) * 100, 4)}%`
              return (
                <div key={row._id || row.shop?._id || "unassigned"} className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-sm font-bold text-violet-800">
                    {getInitials(row.shop?.name || "Unassigned")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{row.shop?.name || "Unassigned"}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-violet-100">
                      <div className="h-full rounded-full bg-violet-600" style={{ width }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{formatRiel(row.totalRevenue)}</span>
                </div>
              )
            }) : (
              <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-6 text-sm text-slate-500">
                No report data available.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}

export default Dashboard
