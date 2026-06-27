import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { adminService } from "../../../services/admin.service"
import { productService } from "../../../services/product.service"
import { supplierService } from "../../../services/supplier.service"

import { LuPackagePlus, LuChevronDown, LuChevronUp, LuFileText } from "react-icons/lu"

export default function StockIn() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    note: "",
    supplierId: "",
    unitCost: "",
    referenceNumber: ""
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    productService.list({ page: 1, limit: 500 })
      .then((response) => setProducts(response.data.result || []))

    supplierService.list({ page: 1, limit: 100 })
      .then((response) => setSuppliers(response.data.result || []))
  }, [])

  const selectedProduct = products.find(p => p._id === form.productId)
  const currentStock = selectedProduct ? Number(selectedProduct.currentStock || 0) : 0
  const qtyInput = Number(form.quantity) || 0
  const newStock = currentStock + qtyInput

  const submit = async (event) => {
    event.preventDefault()

    const quantity = Number(form.quantity)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Quantity must be greater than 0")
      return
    }

    const unitCost = form.unitCost === "" ? undefined : Number(form.unitCost)
    if (unitCost !== undefined && (!Number.isFinite(unitCost) || unitCost < 0)) {
      toast.error("Unit cost must be greater than or equal to 0")
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        productId: form.productId,
        supplierId: form.supplierId,
        quantity,
        unitCost,
        referenceNumber: form.referenceNumber,
        note: form.note,
      }

      if (payload.unitCost === undefined) {
        delete payload.unitCost
      }

      await adminService.stockIn(payload)
      toast.success("Stock added successfully")
      navigate("/admin/inventory")
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Unable to update stock")
    } finally {
      setIsLoading(false)
    }
  }

  const addQty = (amount) => {
    setForm(prev => ({ ...prev, quantity: String((Number(prev.quantity) || 0) + amount) }))
  }

  // Dark/Light theme classes
  const inputClass = "h-12 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#7033ff] focus:ring-2 focus:ring-[#7033ff]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
  const selectClass = "h-12 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] outline-none transition focus:border-[#7033ff] focus:ring-2 focus:ring-[#7033ff]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc]"
  const labelClass = "block text-xs font-semibold uppercase tracking-[0.04em] text-[#64748b] dark:text-[#a1a1aa] mb-2"

  return (
    <div className="w-full max-w-full space-y-6 bg-[#f8fafc] dark:bg-[#09090b] min-h-screen text-[#020617] dark:text-[#f8fafc]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between px-4 pt-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">
            <Link to="/admin/inventory" className="font-medium text-[#7033ff] hover:underline">
              Inventory
            </Link>
            <span>/</span>
            <span>Receive Stock</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7033ff]/10 text-[#7033ff] dark:bg-[#7033ff]/20 dark:text-[#a78bfa]">
              <LuPackagePlus size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#020617] dark:text-[#f8fafc] sm:text-3xl">Receive Stock</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#64748b] dark:text-[#a1a1aa]">
                Quickly receive new inventory and update your stock levels.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <form onSubmit={submit} className="w-full max-w-3xl space-y-6">
          <div className="overflow-hidden rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] shadow-none">
            
            <div className="p-5 sm:p-6 space-y-6">
              
              {/* Product Selection */}
              <div>
                <label className={labelClass}>Select Product <span className="text-red-500">*</span></label>
                <select
                  required
                  className={selectClass}
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                >
                  <option value="" disabled>Search or select product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} (Code: {product.code || "N/A"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Summary Card */}
              {selectedProduct && (
                <div className="rounded-lg border border-[#7033ff]/20 bg-[#7033ff]/5 dark:bg-[#7033ff]/10 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#020617] dark:text-[#f8fafc]">{selectedProduct.name}</h3>
                      <p className="text-sm text-[#64748b] dark:text-[#a1a1aa]">SKU/Code: {selectedProduct.code || "-"}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-[#64748b] dark:text-[#a1a1aa] font-semibold uppercase tracking-wider">Current</p>
                        <p className="text-xl font-bold text-[#020617] dark:text-[#f8fafc]">{currentStock}</p>
                      </div>
                      <div className="text-[#64748b] dark:text-[#a1a1aa] text-xl font-light">+</div>
                      <div className="text-center">
                        <p className="text-xs text-[#7033ff] dark:text-[#a78bfa] font-semibold uppercase tracking-wider">In</p>
                        <p className="text-xl font-bold text-[#7033ff] dark:text-[#a78bfa]">{qtyInput || 0}</p>
                      </div>
                      <div className="text-[#64748b] dark:text-[#a1a1aa] text-xl font-light">=</div>
                      <div className="text-center">
                        <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider">New Stock</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{newStock}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className={labelClass}>Quantity to Receive <span className="text-red-500">*</span></label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    required
                    type="number"
                    min="1"
                    className={`${inputClass} text-lg font-bold sm:max-w-[200px]`}
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0"
                  />
                  <div className="flex gap-2">
                    {[1, 5, 10, 20].map(amount => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => addQty(amount)}
                        className="flex h-12 w-14 items-center justify-center rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] text-sm font-semibold text-[#020617] dark:text-[#f8fafc] hover:border-[#7033ff] hover:text-[#7033ff] dark:hover:border-[#7033ff] dark:hover:text-[#a78bfa] transition-colors"
                      >
                        +{amount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
            
            {/* Advanced Details Toggle */}
            <div className="border-t border-[#e5e7eb] dark:border-[#27272a]">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex w-full items-center justify-between bg-[#f8fafc] dark:bg-[#09090b] px-5 py-4 text-sm font-semibold text-[#020617] dark:text-[#f8fafc] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <LuFileText className="text-[#64748b] dark:text-[#a1a1aa]" /> 
                  Advanced Details
                </span>
                {showAdvanced ? <LuChevronUp className="text-[#64748b] dark:text-[#a1a1aa]" /> : <LuChevronDown className="text-[#64748b] dark:text-[#a1a1aa]" />}
              </button>
              
              {/* Advanced Details Content */}
              {showAdvanced && (
                <div className="p-5 sm:p-6 border-t border-[#e5e7eb] dark:border-[#27272a] space-y-5 bg-white dark:bg-[#111113]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Supplier</label>
                      <select
                        className={selectClass}
                        value={form.supplierId}
                        onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                      >
                        <option value="">No supplier (Direct stock in)</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier._id} value={supplier._id}>
                            {supplier.businessName || supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Unit Cost (Optional)</label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] dark:text-[#a1a1aa]">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className={`${inputClass} pl-8`}
                          value={form.unitCost}
                          onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Reference / PO #</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={form.referenceNumber}
                        onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                        placeholder="e.g., PO-2023-001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Additional Notes</label>
                    <textarea
                      className={`${inputClass} min-h-[100px] py-3 resize-y`}
                      placeholder="Add any extra details regarding this inventory movement..."
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 p-5 border-t border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b]">
              <Link
                to="/admin/inventory"
                className="flex h-12 w-full sm:w-auto items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-6 text-sm font-semibold text-[#020617] transition-colors hover:bg-slate-50 dark:border-[#27272a] dark:bg-[#111113] dark:text-[#f8fafc] dark:hover:bg-white/5"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading || !form.productId || qtyInput <= 0}
                className="flex h-12 w-full sm:w-auto items-center justify-center rounded-lg bg-[#7033ff] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#5f27e6] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Confirm Stock In"}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}
