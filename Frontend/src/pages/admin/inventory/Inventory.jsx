import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { adminService } from "../../../services/admin.service"

function Inventory() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    adminService.inventory()
      .then((response) => setRows(response.data.result || []))
  }, [])

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Inventory</h1>
        <div className="flex gap-2">
          <Link className="btn btn-sm" to="/admin/inventory/adjust">Adjust</Link>
          <Link className="btn btn-sm btn-neutral" to="/admin/inventory/stock-in">Stock in</Link>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto border border-gray-200 bg-white">
        <table className="table">
          <thead><tr><th>Product</th><th>Code</th><th>Quantity</th><th>Reorder level</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id}>
                <td>{row.product?.name || "-"}</td>
                <td>{row.product?.code || "-"}</td>
                <td>{row.quantity}</td>
                <td>{row.reorderLevel}</td>
                <td>{row.quantity <= row.reorderLevel ? "LOW" : "OK"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="5" className="text-center">No inventory data</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default Inventory
