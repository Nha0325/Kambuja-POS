import { useEffect, useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { adminService } from "../../../services/admin.service"
import { productService } from "../../../services/product.service"
import { supplierService } from "../../../services/supplier.service"
import { LuPackagePlus, LuInfo, LuPackage, LuFileText, LuDollarSign } from "react-icons/lu"
import { adminSurface } from "../adminPageUi"

function StockIn() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [form, setForm] = useState({
    productId: "",
    quantityPurchaseUnit: "",
    unitsPerPurchaseUnit: 1,
    supplierId: "",
    invoiceNo: "",
    receivedDate: new Date().toISOString().split('T')[0],
    inputUnit: "",
    costPerPurchaseUnit: "",
    note: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    productService.list({ page: 1, limit: 500 })
      .then((response) => setProducts(response.data.result || []))
    supplierService.list({ page: 1, limit: 100 })
      .then((response) => setSuppliers(response.data.result || []))
  }, [])

  const selectedProduct = useMemo(() => {
    return products.find(p => p._id === form.productId) || null
  }, [form.productId, products])

  useEffect(() => {
    if (!selectedProduct) return

    const purchaseUnitCode = selectedProduct.unitConfig?.purchaseUnit?.code || selectedProduct.unitConfig?.baseUnit?.code || ""
    setForm((current) => ({
      ...current,
      inputUnit: purchaseUnitCode,
      unitsPerPurchaseUnit: Number(selectedProduct.unitConfig?.unitsPerPurchaseUnit || 1),
      supplierId: current.supplierId || selectedProduct.supplier?._id || selectedProduct.supplier || "",
      costPerPurchaseUnit: current.costPerPurchaseUnit || selectedProduct.pricing?.costPerPurchaseUnit || selectedProduct.costPrice || "",
    }))
  }, [selectedProduct])

  const currentStock = selectedProduct ? Number(selectedProduct.stock ?? selectedProduct.stockQtyBase ?? selectedProduct.currentStock ?? 0) : 0;

  const convertedQty = useMemo(() => {
    if (!selectedProduct || form.quantityPurchaseUnit === "") return 0;
    const qty = Number(form.quantityPurchaseUnit);
    const unitCode = form.inputUnit || selectedProduct.unitConfig?.purchaseUnit?.code || selectedProduct.unitConfig?.baseUnit?.code;

    if (unitCode === selectedProduct.unitConfig?.purchaseUnit?.code) {
      return qty * Number(form.unitsPerPurchaseUnit || selectedProduct.unitConfig?.unitsPerPurchaseUnit || 1);
    }
    return qty;
  }, [selectedProduct, form.quantityPurchaseUnit, form.inputUnit, form.unitsPerPurchaseUnit]);

  const newStock = useMemo(() => {
    if (!selectedProduct || form.quantityPurchaseUnit === "") return null;
    return currentStock + convertedQty;
  }, [selectedProduct, form.quantityPurchaseUnit, currentStock, convertedQty]);

  const totalCost = useMemo(() => {
    const qty = Number(form.quantityPurchaseUnit || 0)
    const cost = Number(form.costPerPurchaseUnit || 0)
    return qty * cost
  }, [form.quantityPurchaseUnit, form.costPerPurchaseUnit])

  const handleQuickAdd = (amount) => {
    const currentQty = Number(form.quantityPurchaseUnit) || 0;
    setForm({ ...form, quantityPurchaseUnit: currentQty + amount });
  }

  const submit = async (event) => {
    event.preventDefault()

    if (!form.productId) {
      toast.error("Product is required")
      return
    }

    const quantity = Number(form.quantityPurchaseUnit)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Quantity must be greater than 0")
      return
    }

    const costPerPurchaseUnit = form.costPerPurchaseUnit === "" ? undefined : Number(form.costPerPurchaseUnit)
    if (costPerPurchaseUnit !== undefined && (!Number.isFinite(costPerPurchaseUnit) || costPerPurchaseUnit < 0)) {
      toast.error("Cost per purchase unit must be greater than or equal to 0")
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        productId: form.productId,
        quantityPurchaseUnit: quantity,
        quantity,
        unitsPerPurchaseUnit: Number(form.unitsPerPurchaseUnit || selectedProduct?.unitConfig?.unitsPerPurchaseUnit || 1),
        totalBaseQty: convertedQty,
        supplierId: form.supplierId,
        costPerPurchaseUnit,
        totalCost,
        invoiceNo: form.invoiceNo,
        receivedDate: form.receivedDate,
        inputUnit: form.inputUnit,
        note: form.note,
      }

      if (payload.costPerPurchaseUnit === undefined) delete payload.costPerPurchaseUnit;
      if (!payload.supplierId) delete payload.supplierId;

      await adminService.receiveStock(payload)
      toast.success("Stock received successfully")
      navigate("/admin/inventory")
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Unable to receive stock")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className={adminSurface.header}>
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-[#3350BF]/20 text-violet-600 dark:text-[#22D3EE] border border-violet-200 dark:border-[#3350BF]/50">
              <LuPackagePlus size={20} />
            </div>
            <div>
              <p className={adminSurface.eyebrow}>
                Inventory Management
              </p>
              <h1 className={adminSurface.title}>
                Receive Stock
              </h1>
            </div>
          </div>
          <p className={adminSurface.description}>
            Use for receiving new inventory from supplier or purchase. This increases stock as a normal business stock-in movement.
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
              <div className="space-y-1.5 md:col-span-2">
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

              {selectedProduct && selectedProduct.unitConfig && (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Input Unit*</label>
                  <select
                    className={`${adminSurface.select} w-full`}
                    value={form.inputUnit}
                    onChange={(e) => setForm({ ...form, inputUnit: e.target.value })}
                  >
                    <option value="">Default ({selectedProduct.unitConfig.purchaseUnit?.nameKh || 'Unit'})</option>
                    {selectedProduct.unitConfig.purchaseUnit && (
                      <option value={selectedProduct.unitConfig.purchaseUnit.code}>
                        {selectedProduct.unitConfig.purchaseUnit.nameKh} ({selectedProduct.unitConfig.unitsPerPurchaseUnit} Base Units)
                      </option>
                    )}
                    {selectedProduct.unitConfig.baseUnit && (
                      <option value={selectedProduct.unitConfig.baseUnit.code}>
                        {selectedProduct.unitConfig.baseUnit.nameKh} (Base Unit)
                      </option>
                    )}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Quantity Purchase Unit*</label>
                <input
                  required
                  type="number"
                  min="1"
                  className={`${adminSurface.input} w-full`}
                  value={form.quantityPurchaseUnit}
                  onChange={(e) => setForm({ ...form, quantityPurchaseUnit: e.target.value })}
                  placeholder="Enter purchase quantity"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Units Per Purchase Unit*</label>
                <input
                  required
                  type="number"
                  min="0.0001"
                  step="any"
                  className={`${adminSurface.input} w-full`}
                  value={form.unitsPerPurchaseUnit}
                  onChange={(e) => setForm({ ...form, unitsPerPurchaseUnit: e.target.value })}
                  placeholder="24"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB] invisible">Quick Add</label>
                <div className="flex items-center gap-2 h-11">
                  {[1, 5, 10, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleQuickAdd(num)}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-[#2A2E36] bg-slate-50 dark:bg-[#1A1D22] text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#2A2E36] transition-colors h-full"
                    >
                      +{num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {selectedProduct && form.quantityPurchaseUnit !== "" && (
              <div className="mt-6 rounded-xl border border-slate-200 dark:border-[#2A2E36] bg-slate-50 dark:bg-[#111318] p-4 flex items-center justify-between text-sm shadow-sm">
                <div className="text-center flex-1">
                  <p className="text-slate-500 dark:text-[#A9A6BB] mb-1 font-medium">Current Stock</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{currentStock} {selectedProduct.unitConfig?.baseUnit?.nameKh || ""}</p>
                </div>
                <div className="text-center flex-1 border-x border-slate-200 dark:border-[#2A2E36]">
                  <p className="text-slate-500 dark:text-[#A9A6BB] mb-1 font-medium">Receiving (Base)</p>
                  <p className="text-xl font-bold text-emerald-500">+{convertedQty} {selectedProduct.unitConfig?.baseUnit?.nameKh || ""}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-slate-500 dark:text-[#A9A6BB] mb-1 font-medium">New Stock (Base)</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{newStock} {selectedProduct.unitConfig?.baseUnit?.nameKh || ""}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-[#F8FAFC] border-b border-slate-200 dark:border-[#2A2E36] pb-3">
              <LuFileText className="text-violet-600 dark:text-[#22D3EE]" /> Advanced Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Cost Per Purchase Unit (Optional)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    className={`${adminSurface.input} pl-8 w-full`}
                    value={form.costPerPurchaseUnit}
                    onChange={(e) => setForm({ ...form, costPerPurchaseUnit: e.target.value })}
                    placeholder="0.00"
                  />
                  <LuDollarSign className="absolute bottom-[13px] left-3 text-[#6B7280]" size={16} />
                </div>
                <p className="mt-1 text-xs text-[#64748b] dark:text-[#a1a1aa]">
                  Total cost: ${totalCost.toFixed(2)}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Invoice / Ref No.</label>
                <input
                  type="text"
                  className={`${adminSurface.input} w-full`}
                  value={form.invoiceNo}
                  onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
                  placeholder="e.g., INV-2023-001"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">Received Date</label>
                <input
                  type="date"
                  className={`${adminSurface.input} w-full`}
                  value={form.receivedDate}
                  onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
                />
              </div>
            </div>
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
              disabled={isLoading || !form.productId || !form.quantityPurchaseUnit}
              className={adminSurface.primaryButton}
            >
              {isLoading ? "Processing..." : "Confirm Receive Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockIn
