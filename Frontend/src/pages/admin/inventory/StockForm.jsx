import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { adminService } from "../../../services/admin.service"
import { productService } from "../../../services/product.service"

function StockForm({ mode }) {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ productId: "", quantity: "", note: "" })

  useEffect(() => {
    productService.list({ page: 1, limit: 200 })
      .then((response) => setProducts(response.data.result || []))
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    try {
      const payload = { ...form, quantity: Number(form.quantity) }
      if (mode === "stock-in") await adminService.stockIn(payload)
      else await adminService.adjustStock(payload)
      toast.success(mode === "stock-in" ? "Stock added" : "Stock adjusted")
      navigate("/admin/inventory")
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to update stock")
    }
  }

  return (
    <section className="w-full max-w-xl">
      <h1 className="text-xl font-semibold">{mode === "stock-in" ? "Stock In" : "Stock Adjustment"}</h1>
      <form onSubmit={submit} className="mt-4 space-y-4 border border-gray-200 bg-white p-5">
        <label className="form-control">
          <span className="mb-1 text-sm">Product</span>
          <select required className="select select-bordered" value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })}>
            <option value="">Select product</option>
            {products.map((product) => <option key={product._id} value={product._id}>{product.name} ({product.currentStock})</option>)}
          </select>
        </label>
        <label className="form-control">
          <span className="mb-1 text-sm">Quantity</span>
          <input required type="number" min={mode === "stock-in" ? "1" : undefined} className="input input-bordered" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
        </label>
        <label className="form-control">
          <span className="mb-1 text-sm">Note</span>
          <input className="input input-bordered" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        </label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link className="btn btn-sm w-full sm:w-auto" to="/admin/inventory">Cancel</Link>
          <button className="btn btn-sm btn-neutral w-full sm:w-auto" type="submit">Save</button>
        </div>
      </form>
    </section>
  )
}

export default StockForm
