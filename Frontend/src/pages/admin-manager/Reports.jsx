import { useEffect, useState } from "react"
import { FaChartColumn, FaDownload } from "react-icons/fa6"
import { adminManagerService } from "../../services/adminManager.service"
import {
  cardClass,
  formatRiel,
  primaryButtonClass,
  tableCellClass,
  tableHeadCellClass,
  tableHeadClass,
} from "./adminManagerUi"
import { PageHeader, TableEmpty } from "./adminManagerComponents"

function Reports() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    adminManagerService.reports()
      .then((response) => setRows(response.data.result || []))
  }, [])

  const totalRevenue = rows.reduce((sum, row) => sum + Number(row.totalRevenue || 0), 0)
  const totalSales = rows.reduce((sum, row) => sum + Number(row.totalSales || 0), 0)
  const maxRevenue = Math.max(...rows.map((row) => Number(row.totalRevenue || 0)), 1)

  return (
    <section>
      <PageHeader
        title="Platform Reports"
        description="Compare shop sales and revenue from the current reporting endpoint."
        action={(
          <button className={primaryButtonClass} type="button">
            <FaDownload />
            Export
          </button>
        )}
      />

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-gray-500">Revenue</p>
          <strong className="block text-2xl font-bold text-gray-950">{formatRiel(totalRevenue)}</strong>
        </article>
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-gray-500">Sales</p>
          <strong className="block text-2xl font-bold text-gray-950">{totalSales.toLocaleString()}</strong>
        </article>
        <article className={`${cardClass} p-5`}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-gray-500">Reported Shops</p>
          <strong className="block text-2xl font-bold text-gray-950">{rows.length.toLocaleString()}</strong>
        </article>
      </div>

      <div className={`${cardClass} mb-6 p-6 md:p-8`}>
        <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-gray-950">
          <FaChartColumn />
          Revenue Distribution
        </h3>
        <div className="space-y-4">
          {rows.length > 0 ? rows.slice(0, 8).map((row) => {
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
              No report data available.
            </div>
          )}
        </div>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Shop</th>
                <th className={tableHeadCellClass}>Sales</th>
                <th className={tableHeadCellClass}>Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row) => (
                <tr key={row._id || row.shop?._id || "unassigned"} className="transition-colors hover:bg-[#f3f4f5]">
                  <td className={tableCellClass}>{row.shop?.name || "Unassigned"}</td>
                  <td className={tableCellClass}>{Number(row.totalSales || 0).toLocaleString()}</td>
                  <td className={tableCellClass}>{formatRiel(row.totalRevenue)}</td>
                </tr>
              ))}
              {rows.length === 0 && <TableEmpty colSpan="3">No report data</TableEmpty>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Reports
