import { useCallback, useEffect, useMemo, useState } from "react"
import { FaDownload, FaMagnifyingGlass, FaTriangleExclamation } from "react-icons/fa6"
import { adminService } from "../../../services/admin.service"
import { downloadCsv } from "../../../utils/downloadCsv"
import { formatApiError } from "../../../utils/formatApiError"
import {
  cardClass,
  inputClass,
  primaryButtonClass,
  tableCellClass,
  tableHeadCellClass,
  tableHeadClass,
} from "../adminManagerUi"
import { PageHeader, TableEmpty } from "../components/AdminManagerUi"

function getShopName(row) {
  if (row.shopId && typeof row.shopId === "object") return row.shopId.name || row.shopId.code || "-"
  return row.shopId || "-"
}

const getStockPercent = (row) => {
  const maxStock = Number(row.maxStock || 0);
  const quantity = Number(row.quantity || 0);

  if (maxStock <= 0) return null;

  return Math.round((quantity / maxStock) * 100);
};

const isLow50 = (row) => {
  const maxStock = Number(row.maxStock || 0);
  const quantity = Number(row.quantity || 0);

  if (maxStock > 0) return quantity <= maxStock * 0.5;

  return quantity <= Number(row.reorderLevel || 0);
};

function Stock() {
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const loadStock = useCallback(() => {
    setIsLoading(true)
    setError("")
    return adminService.inventory()
      .then((response) => setRows(response.data.result || []))
      .catch((loadError) => {
        if (loadError?.response?.status !== 401) {
          setError(formatApiError(loadError) || "Unable to load stock")
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    loadStock()
  }, [loadStock])

  const displayedRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return rows

    return rows.filter((row) => (
      row.product?.name?.toLowerCase().includes(term)
      || row.product?.code?.toLowerCase().includes(term)
      || getShopName(row).toLowerCase().includes(term)
    ))
  }, [rows, search])

  const totalQuantity = displayedRows.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
  const lowStockCount = displayedRows.filter(isLow50).length
  const healthyCount = displayedRows.length - lowStockCount

  const exportStock = () => {
    downloadCsv(
      "admin-manager-stock.csv",
      [
        { label: "Shop", value: (row) => getShopName(row) },
        { label: "Product", value: (row) => row.product?.name || "" },
        { label: "Code", value: (row) => row.product?.code || "" },
        { label: "Quantity", value: (row) => Number(row.quantity || 0) },
        { label: "Max Stock", value: (row) => Number(row.maxStock || 0) },
        { label: "Stock %", value: (row) => {
            const p = getStockPercent(row);
            return p !== null ? `${p}%` : "N/A";
        } },
        { label: "Reorder Level", value: (row) => Number(row.reorderLevel || 0) },
        { label: "Status", value: (row) => isLow50(row) ? "LOW" : "OK" },
      ],
      displayedRows
    )
  }

  return (
    <section>
      <PageHeader
        title="Stock"
        description="Monitor product quantities and low-stock signals across shops."
        action={(
          <button className={primaryButtonClass} type="button" onClick={exportStock} disabled={displayedRows.length === 0}>
            <FaDownload />
            Export
          </button>
        )}
      />

      {lowStockCount > 0 && (
        <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 flex items-center gap-2">
          <FaTriangleExclamation />
          <strong>Low stock alert:</strong> {lowStockCount} products are below 50% stock.
        </div>
      )}

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
            placeholder="Search by shop, product, or code..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        {[
          ["Products", displayedRows.length],
          ["Total Quantity", totalQuantity],
          ["Low Stock 50%", lowStockCount],
          ["Healthy", healthyCount],
        ].map(([label, value]) => (
          <article key={label} className={`${cardClass} p-5`}>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-500">{label}</p>
            <strong className="block text-2xl font-bold text-slate-900">{Number(value || 0).toLocaleString()}</strong>
          </article>
        ))}
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border-collapse">
            <thead className={tableHeadClass}>
              <tr>
                <th className={tableHeadCellClass}>Shop</th>
                <th className={tableHeadCellClass}>Product</th>
                <th className={tableHeadCellClass}>Code</th>
                <th className={`${tableHeadCellClass} text-right`}>Quantity</th>
                <th className={`${tableHeadCellClass} text-right`}>Max Stock</th>
                <th className={`${tableHeadCellClass} text-right`}>Stock %</th>
                <th className={`${tableHeadCellClass} text-right`}>Reorder Level</th>
                <th className={`${tableHeadCellClass} text-center`}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-100">
              {isLoading ? (
                <TableEmpty colSpan="8">Loading stock...</TableEmpty>
              ) : displayedRows.map((row) => {
                const isLow = isLow50(row)
                const percent = getStockPercent(row)

                return (
                  <tr key={row._id} className="transition-colors hover:bg-violet-50/50">
                    <td className={tableCellClass}>{getShopName(row)}</td>
                    <td className={`${tableCellClass} font-semibold text-slate-900`}>{row.product?.name || "-"}</td>
                    <td className={`${tableCellClass} font-semibold uppercase`}>{row.product?.code || "-"}</td>
                    <td className={`${tableCellClass} text-right`}>{Number(row.quantity || 0).toLocaleString()}</td>
                    <td className={`${tableCellClass} text-right`}>{Number(row.maxStock || 0).toLocaleString()}</td>
                    <td className={`${tableCellClass} text-right`}>{percent !== null ? `${percent}%` : "-"}</td>
                    <td className={`${tableCellClass} text-right`}>{Number(row.reorderLevel || 0).toLocaleString()}</td>
                    <td className={`${tableCellClass} text-center`}>
                      <span className={isLow ? "inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700" : "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"}>
                        {isLow && <FaTriangleExclamation />}
                        {isLow ? "LOW 50%" : "OK"}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {!isLoading && displayedRows.length === 0 && <TableEmpty colSpan="8">No stock data</TableEmpty>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Stock
