import { useCallback, useEffect, useMemo, useState } from "react"
import { FaChartColumn, FaDownload, FaMagnifyingGlass } from "react-icons/fa6"
import { adminManagerService } from "../../../services/adminManager.service"
import { downloadCsv } from "../../../utils/downloadCsv"
import { formatApiError } from "../../../utils/formatApiError"
import {
  cardClass,
  formatRiel,
  inputClass,
  primaryButtonClass,
  tableCellClass,
  tableHeadCellClass,
  tableHeadClass,
} from "../adminManagerUi"
import { PageHeader, TableEmpty } from "../components/AdminManagerUi"

function Reports() {
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const loadReports = useCallback(() => {
    setIsLoading(true)
    setError("")
    return adminManagerService.reports()
      .then((response) => setRows(response.data.result || []))
      .catch((loadError) => {
        if (loadError?.response?.status !== 401) {
          setError(formatApiError(loadError) || "Unable to load reports")
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const displayedRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows

    return rows.filter((row) => (
      row.shop?.name?.toLowerCase().includes(term)
      || row.shop?.code?.toLowerCase().includes(term)
    ))
  }, [rows, search])

  const totalRevenue = displayedRows.reduce((sum, row) => sum + Number(row.totalRevenue || 0), 0)
  const totalSales = displayedRows.reduce((sum, row) => sum + Number(row.totalSales || 0), 0)
  const maxRevenue = Math.max(...displayedRows.map((row) => Number(row.totalRevenue || 0)), 1)

  const exportReports = () => {
    downloadCsv(
      "admin-manager-reports.csv",
      [
        { label: "Shop", value: (row) => row.shop?.name || "Unassigned" },
        { label: "Shop Code", value: (row) => row.shop?.code || "" },
        { label: "Sales", value: (row) => Number(row.totalSales || 0) },
        { label: "Revenue", value: (row) => Number(row.totalRevenue || 0) },
      ],
      displayedRows
    )
  }

  return (
    <section>
      <PageHeader
        title="Platform Reports"
        description="Compare shop sales and revenue from the current reporting endpoint."
        action={(
          <button className={primaryButtonClass} type="button" onClick={exportReports} disabled={displayedRows.length === 0}>
            <FaDownload />
            Export
          </button>
        )}
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-4">
        <label className="relative block max-w-md">
          <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className={`${inputClass} pl-10`}
            placeholder="Search by shop name or code..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Revenue</p>
          <strong className="block text-2xl font-bold text-slate-900">{formatRiel(totalRevenue)}</strong>
        </article>
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Sales</p>
          <strong className="block text-2xl font-bold text-slate-900">{totalSales.toLocaleString()}</strong>
        </article>
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Reported Shops</p>
          <strong className="block text-2xl font-bold text-slate-900">{displayedRows.length.toLocaleString()}</strong>
        </article>
      </div>

      <div className={`${cardClass} mb-6 p-6 md:p-8`}>
        <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
          <FaChartColumn />
          Revenue Distribution
        </h3>
        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-6 text-sm text-slate-500">
              Loading reports...
            </div>
          ) : displayedRows.length > 0 ? displayedRows.slice(0, 8).map((row) => {
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
              No report data available.
            </div>
          )}
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Shop</th>
                <th className={tableHeadCellClass}>Sales</th>
                <th className={tableHeadCellClass}>Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-100">
              {isLoading ? (
                <TableEmpty colSpan="3">Loading reports...</TableEmpty>
              ) : displayedRows.map((row) => (
                <tr key={row._id || row.shop?._id || "unassigned"} className="transition-colors hover:bg-violet-50/50">
                  <td className={tableCellClass}>{row.shop?.name || "Unassigned"}</td>
                  <td className={tableCellClass}>{Number(row.totalSales || 0).toLocaleString()}</td>
                  <td className={tableCellClass}>{formatRiel(row.totalRevenue)}</td>
                </tr>
              ))}
              {!isLoading && displayedRows.length === 0 && <TableEmpty colSpan="3">No report data</TableEmpty>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Reports
