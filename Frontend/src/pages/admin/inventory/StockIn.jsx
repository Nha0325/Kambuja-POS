import { useEffect, useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { adminService } from "../../../services/users/admin.service"
import { productService } from "../../../services/inventory/product.service"
import { supplierService } from "../../../services/purchase/supplier.service"
import { LuPackagePlus, LuInfo, LuPackage, LuFileText, LuDollarSign } from "react-icons/lu"
import { adminSurface } from "../adminPageUi"
import { useTranslation } from "react-i18next";

function StockIn() {
  const { t } = useTranslation();
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
      toast.error(t('product_is_required'))
      return
    }

    const quantity = Number(form.quantityPurchaseUnit)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error(t('qty_greater_than_0'))
      return
    }

    const costPerPurchaseUnit = form.costPerPurchaseUnit === "" ? undefined : Number(form.costPerPurchaseUnit)
    if (costPerPurchaseUnit !== undefined && (!Number.isFinite(costPerPurchaseUnit) || costPerPurchaseUnit < 0)) {
      toast.error(t('cost_greater_than_0'))
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
      toast.success(t('stock_received_success'))
      navigate("/admin/inventory")
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || t('unable_to_receive_stock'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <nav className="mb-2 flex items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">
        <Link to="/admin/inventory" className="hover:text-[#06b6d4]">{t('inventory')}</Link>
        <span className="text-[#64748b] dark:text-[#a1a1aa]">&gt;</span>
        <span className="font-semibold text-[#020617] dark:text-[#f8fafc]">{t('stock_in')}</span>
      </nav>
      <div className={adminSurface.header}>
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 dark:bg-[#06b6d4]/20 text-cyan-600 dark:text-[#06b6d4] border border-cyan-200 dark:border-[#06b6d4]/50">
              <LuPackagePlus size={20} />
            </div>
            <div>
              <p className={adminSurface.eyebrow}>
                {t('inventory_management')}
              </p>
              <h1 className={adminSurface.title}>
                {t('receive_stock')}
              </h1>
            </div>
          </div>
          <p className={adminSurface.description}>
            {t('receive_stock_desc')}
          </p>
        </div>
      </div>

      <div className={adminSurface.card}>
        <form onSubmit={submit} className="space-y-8">
          <div className="space-y-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-[#F8FAFC] border-b border-slate-200 dark:border-[#2A2E36] pb-3">
              <LuPackage className="text-cyan-600 dark:text-[#06b6d4]" /> {t('product_details')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">{t('select_product')}</label>
                <select
                  required
                  className={`${adminSurface.select} w-full`}
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                >
                  <option value="" disabled>{t('search_select_product')}</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} ({t('code')}: {product.code || "N/A"})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && selectedProduct.unitConfig && (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">{t('input_unit')}</label>
                  <select
                    className={`${adminSurface.select} w-full`}
                    value={form.inputUnit}
                    onChange={(e) => setForm({ ...form, inputUnit: e.target.value })}
                  >
                    <option value="">{t('default_unit')} ({selectedProduct.unitConfig.purchaseUnit?.nameKh || 'Unit'})</option>
                    {selectedProduct.unitConfig.purchaseUnit && (
                      <option value={selectedProduct.unitConfig.purchaseUnit.code}>
                        {selectedProduct.unitConfig.purchaseUnit.nameKh} ({selectedProduct.unitConfig.unitsPerPurchaseUnit} {t('base_units')})
                      </option>
                    )}
                    {selectedProduct.unitConfig.baseUnit && (
                      <option value={selectedProduct.unitConfig.baseUnit.code}>
                        {selectedProduct.unitConfig.baseUnit.nameKh} ({t('base_unit')})
                      </option>
                    )}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">{t('quantity_purchase_unit')}</label>
                <input
                  required
                  type="number"
                  min="1"
                  className={`${adminSurface.input} w-full`}
                  value={form.quantityPurchaseUnit}
                  onChange={(e) => setForm({ ...form, quantityPurchaseUnit: e.target.value })}
                  placeholder={t('enter_purchase_qty')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">{t('units_per_purchase_unit')}</label>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB] invisible">{t('quick_add')}</label>
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
                  <p className="text-slate-500 dark:text-[#A9A6BB] mb-1 font-medium">{t('current_stock')}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{currentStock} {selectedProduct.unitConfig?.baseUnit?.nameKh || ""}</p>
                </div>
                <div className="text-center flex-1 border-x border-slate-200 dark:border-[#2A2E36]">
                  <p className="text-slate-500 dark:text-[#A9A6BB] mb-1 font-medium">{t('receiving_base')}</p>
                  <p className="text-xl font-bold text-emerald-500">+{convertedQty} {selectedProduct.unitConfig?.baseUnit?.nameKh || ""}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-slate-500 dark:text-[#A9A6BB] mb-1 font-medium">{t('new_stock_base')}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{newStock} {selectedProduct.unitConfig?.baseUnit?.nameKh || ""}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-[#F8FAFC] border-b border-slate-200 dark:border-[#2A2E36] pb-3">
              <LuFileText className="text-cyan-600 dark:text-[#06b6d4]" /> {t('advanced_details')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">{t('supplier')}</label>
                <select
                  className={`${adminSurface.select} w-full`}
                  value={form.supplierId}
                  onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                >
                  <option value="">{t('no_supplier_direct')}</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.businessName || supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">{t('cost_per_purchase_unit_optional')}</label>
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
                  {t('total_cost_label')} ${totalCost.toFixed(2)}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">{t('invoice_ref_no')}</label>
                <input
                  type="text"
                  className={`${adminSurface.input} w-full`}
                  value={form.invoiceNo}
                  onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
                  placeholder="e.g., INV-2023-001"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">{t('received_date')}</label>
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
              <LuInfo className="text-cyan-600 dark:text-[#06b6d4]" /> {t('additional_notes')}
            </h2>
            <textarea
              className={`${adminSurface.input} w-full py-3 h-auto min-h-[100px] resize-y`}
              placeholder={t('add_extra_details_inventory')}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            ></textarea>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-200 dark:border-[#2A2E36]">
            <Link to="/admin/inventory" className={adminSurface.secondaryButton}>
              {t('cancel')}
            </Link>
            <button
              type="submit"
              disabled={isLoading || !form.productId || !form.quantityPurchaseUnit}
              className={adminSurface.primaryButton}
            >
              {isLoading ? t('processing') : t('confirm_receive_stock')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockIn
