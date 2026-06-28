import { useEffect, useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { adminService } from "../../../services/admin.service"
import { productService } from "../../../services/product.service"
import { LuSlidersHorizontal, LuInfo, LuPackage } from "react-icons/lu"
import { adminSurface } from "../adminPageUi"

function StockAdjustment() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])

  const [form, setForm] = useState({
    productId: "",
    adjustmentType: "INCREASE",
    quantity: "",
    reason: "",
    inputUnit: "",
    note: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    productService.list({ page: 1, limit: 500 })
      .then((response) => setProducts(response.data.result || []))
  }, [])

  const selectedProduct = useMemo(() => {
    return products.find(p => p._id === form.productId) || null
  }, [form.productId, products])

  const currentStock = selectedProduct ? Number(selectedProduct.stock ?? selectedProduct.stockQtyBase ?? selectedProduct.currentStock ?? 0) : 0;

  const convertedQty = useMemo(() => {
    if (!selectedProduct || form.quantity === "") return 0;
    const qty = Number(form.quantity);
    const unitCode = form.inputUnit || selectedProduct.unitConfig?.baseUnit?.code;

    if (unitCode === selectedProduct.unitConfig?.purchaseUnit?.code) {
      return qty * (selectedProduct.unitConfig?.unitsPerPurchaseUnit || 1);
    }
    return qty;
  }, [selectedProduct, form.quantity, form.inputUnit]);

  const newStock = useMemo(() => {
    if (!selectedProduct || form.quantity === "") return null;
    if (form.adjustmentType === "INCREASE") return currentStock + convertedQty;
    if (form.adjustmentType === "DECREASE") return currentStock - convertedQty;
    if (form.adjustmentType === "SET_EXACT") return convertedQty;
    return currentStock;
  }, [selectedProduct, form.quantity, form.adjustmentType, currentStock, convertedQty])

  const submit = async (event) => {
    event.preventDefault()

    if (!form.productId) {
      toast.error("Product is required")
      return
    }
    if (!form.reason) {
      toast.error("Reason is required")
      return
    }

    const quantity = Number(form.quantity)
    if (form.adjustmentType === "SET_EXACT") {
      if (quantity < 0 || !Number.isFinite(quantity)) {
        toast.error("Quantity cannot be negative")
        return
      }
    } else {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        toast.error("Quantity must be greater than 0")
        return
      }
    }

    if (newStock !== null && newStock < 0) {
      toast.error("Decrease cannot make stock below 0")
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        productId: form.productId,
        type: "STOCK_ADJUSTMENT",
        adjustmentType: form.adjustmentType,
        quantity,
        previousStock: currentStock,
        newStock,
        reason: form.reason,
        inputUnit: form.inputUnit,
        note: form.note,
      }

      await adminService.adjustStock(payload)
      toast.success("Stock adjusted successfully")
      navigate("/admin/inventory")
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Unable to update stock")
    } finally {
      setIsLoading(false)
    }
  }

  const quantityLabel = () => {
    if (form.adjustmentType === "INCREASE") return "Quantity to add*";
    if (form.adjustmentType === "DECREASE") return "Quantity to remove*";
    return "New final stock*";
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className={adminSurface.header}>
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-[#3350BF]/20 text-violet-600 dark:text-[#22D3EE] border border-violet-200 dark:border-[#3350BF]/50">
              <LuSlidersHorizontal size={20} />
            </div>
            <div>
              <p className={adminSurface.eyebrow}>
                Inventory Management
              </p>
              <h1 className={adminSurface.title}>
                Stock Adjustment
              </h1>
            </div>
          </div>
          <p className={adminSurface.description}>
            Use only for correcting stock mismatch, damaged items, missing items, expired items, or physical count correction.
          </p>
        </div>
      </div>

      <div className={adminSurface.card}>
        <form onSubmit={submit} className="space-y-8">
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
                      {product.name} (Code: {product.code || "N/A"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Current Stock</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  className={`${adminSurface.input} w-full bg-slate-50 opacity-80 cursor-not-allowed`}
                  value={selectedProduct ? currentStock : ""}
                  placeholder="Select a product first"
                />
              </div>

              {selectedProduct && selectedProduct.unitConfig && (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Input Unit*</label>
                  <select
                    className={`${adminSurface.select} w-full`}
                    value={form.inputUnit}
                    onChange={(e) => setForm({ ...form, inputUnit: e.target.value })}
                  >
                    <option value="">Default ({selectedProduct.unitConfig.baseUnit?.nameKh || 'Unit'})</option>
                    {selectedProduct.unitConfig.baseUnit && (
                      <option value={selectedProduct.unitConfig.baseUnit.code}>
                        {selectedProduct.unitConfig.baseUnit.nameKh} (Base Unit)
                      </option>
                    )}
                    {selectedProduct.unitConfig.purchaseUnit && (
                      <option value={selectedProduct.unitConfig.purchaseUnit.code}>
                        {selectedProduct.unitConfig.purchaseUnit.nameKh} ({selectedProduct.unitConfig.unitsPerPurchaseUnit} Base Units)
                      </option>
                    )}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Adjustment Type*</label>
                <select
                  required
                  className={`${adminSurface.select} w-full`}
                  value={form.adjustmentType}
                  onChange={(e) => setForm({ ...form, adjustmentType: e.target.value, quantity: "" })}
                >
                  <option value="INCREASE">INCREASE (+)</option>
                  <option value="DECREASE">DECREASE (-)</option>
                  <option value="SET_EXACT">SET_EXACT</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">{quantityLabel()}</label>
                <input
                  required
                  type="number"
                  min="0"
                  className={`${adminSurface.input} w-full`}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Reason*</label>
                <select
                  required
                  className={`${adminSurface.select} w-full`}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                >
                  <option value="" disabled>Select reason</option>
                  <option value="Expired">Expired</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Lost">Lost</option>
                  <option value="Physical count correction">Physical count correction</option>
                  <option value="Return from customer">Return from customer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {selectedProduct && form.quantity !== "" && (
              <div className="mt-6 rounded-xl border border-slate-200 dark:border-[#2A2E36] bg-slate-50 dark:bg-[#111318] p-4 flex items-center justify-between text-sm shadow-sm">
                <div className="text-center flex-1">
                  <p className="text-slate-500 dark:text-[#A9A6BB] mb-1 font-medium">Current Stock</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{currentStock} {selectedProduct.unitConfig?.baseUnit?.nameKh || ""}</p>
                </div>
                <div className="text-center flex-1 border-x border-slate-200 dark:border-[#2A2E36]">
                  <p className="text-slate-500 dark:text-[#A9A6BB] mb-1 font-medium">Change (Base)</p>
                  <p className={`text-xl font-bold ${form.adjustmentType === 'DECREASE' ? 'text-red-500' : form.adjustmentType === 'INCREASE' ? 'text-emerald-500' : 'text-violet-500'}`}>
                    {form.adjustmentType === "DECREASE" ? "-" : form.adjustmentType === "INCREASE" ? "+" : ""}
                    {form.adjustmentType === "SET_EXACT" ? (newStock - currentStock > 0 ? `+${newStock - currentStock}` : newStock - currentStock) : convertedQty}
                    {" "}{selectedProduct.unitConfig?.baseUnit?.nameKh || ""}
                  </p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-slate-500 dark:text-[#A9A6BB] mb-1 font-medium">New Stock (Base)</p>
                  <p className={`text-xl font-bold ${newStock < 0 ? 'text-red-500' : 'text-slate-900 dark:text-[#F8FAFC]'}`}>{newStock} {selectedProduct.unitConfig?.baseUnit?.nameKh || ""}</p>
                </div>
              </div>
            )}
          </div>

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

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-200 dark:border-[#2A2E36]">
            <Link to="/admin/inventory" className={adminSurface.secondaryButton}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading || !form.productId || form.quantity === "" || !form.reason || (newStock !== null && newStock < 0)}
              className={adminSurface.primaryButton}
            >
              {isLoading ? "Processing..." : "Confirm Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockAdjustment
