import { useEffect, useState } from "react"
import {
  FaBuilding,
  FaChartColumn,
  FaGaugeHigh,
  FaListCheck,
  FaUserShield,
} from "react-icons/fa6"
import { adminManagerService } from "../../services/adminManager.service"
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

  useEffect(() => {
    let isMounted = true

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
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError.response?.data?.error || "Unable to load dashboard")
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

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
            <button className={secondaryButtonClass} type="button">Live Totals</button>
            <button className={primaryButtonClass} type="button">Export View</button>
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
              <span className="rounded-lg bg-[#f3f4f5] p-2 text-gray-950">
                <Icon />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.05em] text-gray-500">
                {isLoading ? "Loading" : "Live"}
              </span>
            </div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.05em] text-gray-500">{label}</p>
            <strong className="block text-3xl font-bold text-gray-950">
              {Number(data[key] || 0).toLocaleString()}
            </strong>
          </article>
        ))}
      </div>

      <section className={`${cardClass} mt-6 overflow-hidden lg:flex`}>
        <div className="flex-1 p-6 md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h3 className="text-base font-semibold text-gray-950">Platform Revenue</h3>
              <p className={pageHeaderDescriptionClass}>Aggregate processing volume from the dashboard endpoint.</p>
            </div>
            <div className="rounded-lg border border-gray-300 bg-[#f3f4f5] px-4 py-2 text-sm font-semibold text-gray-950">
              {formatRiel(data.totalRevenue)}
            </div>
          </div>

          <div className="space-y-4">
            {topReports.length > 0 ? topReports.map((row) => {
              const width = `${Math.max((Number(row.totalRevenue || 0) / maxRevenue) * 100, 4)}%`
              return (
                <div key={row._id || row.shop?._id || "unassigned"} className="space-y-2">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold text-gray-950">{row.shop?.name || "Unassigned"}</span>
                    <span className="text-gray-600">{formatRiel(row.totalRevenue)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-[#edeeef]">
                    <div className="h-full rounded-full bg-gray-950" style={{ width }} />
                  </div>
                </div>
              )
            }) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-[#f8f9fa] p-6 text-sm text-gray-500">
                No shop revenue rows available.
              </div>
            )}
          </div>
        </div>

        <aside className="w-full border-t border-gray-300 bg-[#f3f4f5] p-6 md:p-8 lg:w-80 lg:border-l lg:border-t-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-gray-500">Revenue Summary</p>
          <h4 className="text-2xl font-bold text-gray-950">{formatRiel(data.totalRevenue)}</h4>
          <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-950">
              <FaGaugeHigh />
              Dashboard endpoint
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              Monthly trend data is not exposed by the current API response.
            </p>
          </div>
        </aside>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className={`${cardClass} p-6 md:p-8 lg:col-span-2`}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-base font-semibold text-gray-950">Recent Platform Activity</h3>
            <span className="text-xs font-bold uppercase tracking-[0.05em] text-gray-500">Latest logs</span>
          </div>
          <div className="space-y-4">
            {recentLogs.length > 0 ? recentLogs.map((log) => (
              <article key={log._id} className="flex items-start gap-4 rounded-lg border border-transparent p-4 transition-colors hover:border-gray-300 hover:bg-[#f3f4f5]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edeeef] text-gray-950">
                  <FaListCheck />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-800">
                    <span className="font-bold">{log.action}</span> on {log.entityType || "record"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(log.createdAt)} • {log.user?.username || "System"} • {log.shopId?.name || "Platform"}
                  </p>
                </div>
              </article>
            )) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-[#f8f9fa] p-6 text-sm text-gray-500">
                No audit logs available.
              </div>
            )}
          </div>
        </section>

        <section className={`${cardClass} p-6 md:p-8`}>
          <h3 className="mb-6 text-base font-semibold text-gray-950">Top Performing Shops</h3>
          <div className="space-y-6">
            {topReports.length > 0 ? topReports.map((row) => {
              const width = `${Math.max((Number(row.totalRevenue || 0) / maxRevenue) * 100, 4)}%`
              return (
                <div key={row._id || row.shop?._id || "unassigned"} className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-[#edeeef] text-sm font-bold text-gray-950">
                    {getInitials(row.shop?.name || "Unassigned")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-950">{row.shop?.name || "Unassigned"}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-[#edeeef]">
                      <div className="h-full rounded-full bg-gray-950" style={{ width }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-700">{formatRiel(row.totalRevenue)}</span>
                </div>
              )
            }) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-[#f8f9fa] p-6 text-sm text-gray-500">
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
