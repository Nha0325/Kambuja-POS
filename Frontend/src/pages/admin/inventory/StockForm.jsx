import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { adminService } from "../../../services/users/admin.service"
import { productService } from "../../../services/inventory/product.service"
import { supplierService } from "../../../services/purchase/supplier.service"

import { LuPackagePlus, LuSlidersHorizontal, LuInfo, LuPackage, LuDollarSign, LuFileText } from "react-icons/lu"
import { adminSurface } from "../adminPageUi"

function StockForm({ mode }) {
  const navigate = useNavigate()
  const isStockIn = mode === "stock-in"

  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    note: "",
    // Stock In specific
    supplierId: "",
    unitCost: "",
    referenceNumber: "",
    // Adjustment specific
    adjustmentType: "increase",
    reason: ""
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    productService.list({ page: 1, limit: 500 })
      .then((response) => setProducts(response.data.result || []))

    if (isStockIn) {
      supplierService.list({ page: 1, limit: 100 })
        .then((response) => setSuppliers(response.data.result || []))
    }
  }, [isStockIn])

  const submit = async (event) => {
    event.preventDefault()

    const quantity = Number(form.quantity)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Quantity must be greater than 0")
      return
    }

    const unitCost = form.unitCost === "" ? undefined : Number(form.unitCost)
    if (isStockIn && unitCost !== undefined && (!Number.isFinite(unitCost) || unitCost < 0)) {
      toast.error("Unit cost must be greater than or equal to 0")
      return
    }

    setIsLoading(true)
    try {
      const payload = isStockIn
        ? {
            productId: form.productId,
            supplierId: form.supplierId,
            quantity,
            unitCost,
            referenceNumber: form.referenceNumber,
            note: form.note,
          }
        : {
            productId: form.productId,
            type: form.adjustmentType === "increase" ? "INCREASE" : "DECREASE",
            quantity,
            reason: form.reason,
            note: form.note,
          }

      if (payload.unitCost === undefined) {
        delete payload.unitCost
      }

      if (isStockIn) await adminService.stockIn(payload)
      else await adminService.adjustStock(payload)

      toast.success(isStockIn ? "Stock added successfully" : "Stock adjusted successfully")
      navigate("/admin/inventory")
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Unable to update stock")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Page Header */}
      <div className={adminSurface.header}>
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-[#3350BF]/20 text-violet-600 dark:text-[#22D3EE] border border-violet-200 dark:border-[#3350BF]/50">
              {isStockIn ? <LuPackagePlus size={20} /> : <LuSlidersHorizontal size={20} />}
            </div>
            <div>
              <p className={adminSurface.eyebrow}>
                Inventory Management
              </p>
              <h1 className={adminSurface.title}>
                {isStockIn ? "Receive Stock" : "Stock Adjustment"}
              </h1>
            </div>
          </div>
          <p className={adminSurface.description}>
            {isStockIn
              ? "Record new inventory arrivals from your suppliers to keep your stock levels up to date."
              : "Make corrections to system inventory to match your physical stock counts."}
          </p>
        </div>
      </div>

      <div className={adminSurface.card}>
        <form onSubmit={submit} className="space-y-8">

          {/* Section 1: Product Selection */}
          <div className="space-y-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-[#F8FAFC] border-b border-slate-200 dark:border-[#2A2E36] pb-3">
              <LuPackage className="text-violet-600 dark:text-[#22D3EE]" /> Product Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Select Product*</label>
                <select
                  required
                  className={`${adminSurface.select} w-full`}
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                >
                  <option value="" disabled>Search or select product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} (Current: {product.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              {!isStockIn && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Type*</label>
                    <select
                      required
                      className={`${adminSurface.select} w-full`}
                      value={form.adjustmentType}
                      onChange={(e) => setForm({ ...form, adjustmentType: e.target.value })}
                    >
                      <option value="increase">Increase (+)</option>
                      <option value="decrease">Decrease (-)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Reason*</label>
                    <select
                      required
                      className={`${adminSurface.select} w-full`}
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    >
                      <option value="" disabled>Select reason</option>
                      <option value="Damaged">Damaged</option>
                      <option value="Lost">Lost</option>
                      <option value="Expired">Expired</option>
                      <option value="Manual Correction">Manual Correction</option>
                      <option value="Stock Count">Stock Count</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Quantity*</label>
                <input
                  required
                  type="number"
                  min="1"
                  className={`${adminSurface.input} w-full`}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="Enter absolute quantity"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Stock In Specifics */}
          {isStockIn && (
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-[#F8FAFC] border-b border-slate-200 dark:border-[#2A2E36] pb-3">
                <LuFileText className="text-violet-600 dark:text-[#22D3EE]" /> Receiving Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Supplier</label>
                  <select
                    className={`${adminSurface.select} w-full`}
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

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Unit Cost (Optional)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className={`${adminSurface.input} pl-8 w-full`}
                      value={form.unitCost}
                      onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
                      placeholder="0.00"
                    />
                    <LuDollarSign className="absolute bottom-[13px] left-3 text-[#6B7280]" size={16} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Reference / PO #</label>
                  <input
                    type="text"
                    className={`${adminSurface.input} w-full`}
                    value={form.referenceNumber}
                    onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                    placeholder="e.g., PO-2023-001"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Notes */}
          <div className="space-y-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-[#F8FAFC] border-b border-slate-200 dark:border-[#2A2E36] pb-3">
              <LuInfo className="text-violet-600 dark:text-[#22D3EE]" /> Additional Notes
            </h2>
            <textarea
              className={`${adminSurface.input} w-full py-3 h-auto min-h-[100px] resize-y`}
              placeholder="Add any extra details regarding this inventory movement..."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-200 dark:border-[#2A2E36]">
            <Link
              to="/admin/inventory"
              className={adminSurface.secondaryButton}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading || !form.productId || !form.quantity || (!isStockIn && !form.reason)}
              className={adminSurface.primaryButton}
            >
              {isLoading ? "Processing..." : (isStockIn ? "Confirm Stock In" : "Confirm Adjustment")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockForm
