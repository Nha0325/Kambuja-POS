import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { adminService } from "../../../services/admin.service"
import { adminSurface } from "../adminPageUi"

function Inventory() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    adminService.inventory()
      .then((response) => setRows(response.data.result || []))
  }, [])

  const totalQuantity = rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
  const lowStockCount = rows.filter((row) => Number(row.quantity || 0) <= Number(row.reorderLevel || 0)).length
  const okStockCount = rows.length - lowStockCount

  return (
    <section className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>Stock Control</p>
          <h1 className={adminSurface.title}>Inventory</h1>
          <p className={adminSurface.description}>
            Review product quantities, reorder levels, and low-stock inventory signals.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link className={adminSurface.secondaryButton} to="/admin/inventory/adjust">Adjust</Link>
          <Link className={adminSurface.primaryButton} to="/admin/inventory/stock-in">Stock in</Link>
        </div>
      </div>

      <div className={adminSurface.statGrid}>
        {[
          ["Products", rows.length],
          ["Total quantity", totalQuantity],
          ["Low stock", lowStockCount],
          ["Healthy", okStockCount],
        ].map(([label, value]) => (
          <div key={label} className={adminSurface.statCard}>
            <div className={adminSurface.statIcon}>{String(label).slice(0, 1)}</div>
            <p className={`mt-4 ${adminSurface.statLabel}`}>{label}</p>
            <p className={adminSurface.statValue}>{value}</p>
          </div>
        ))}
      </div>

      <div className={adminSurface.tableShell}>
        <div className={adminSurface.toolbar}>
          <p className="text-sm font-semibold text-[#0b1c30]">Inventory overview</p>
          <p className="mt-1 text-xs text-[#5b6472]">{rows.length} product row(s) displayed</p>
        </div>
        <div className={adminSurface.tableWrap}>
        <table className={`${adminSurface.table} min-w-[720px]`}>
          <thead className={adminSurface.tableHead}>
            <tr>
              <th className={adminSurface.th}>Product</th>
              <th className={adminSurface.th}>Code</th>
              <th className={`${adminSurface.th} text-right`}>Quantity</th>
              <th className={`${adminSurface.th} text-right`}>Reorder level</th>
              <th className={`${adminSurface.th} text-center`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isLow = Number(row.quantity || 0) <= Number(row.reorderLevel || 0)

              return (
                <tr key={row._id} className={adminSurface.row}>
                  <td className={`${adminSurface.td} font-semibold text-[#0b1c30]`}>{row.product?.name || "-"}</td>
                  <td className={`${adminSurface.td} font-semibold uppercase text-[#213145]`}>{row.product?.code || "-"}</td>
                  <td className={`${adminSurface.td} text-right text-[#45464d]`}>{row.quantity}</td>
                  <td className={`${adminSurface.td} text-right text-[#45464d]`}>{row.reorderLevel}</td>
                  <td className={`${adminSurface.td} text-center`}>
                    <span className={isLow ? "inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700" : "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"}>
                      {isLow ? "LOW" : "OK"}
                    </span>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-sm text-[#5b6472]">No inventory data</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  )
}

export default Inventory
