import { useEffect, useState, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { adminService } from "../../../services/users/admin.service"
import { productService } from "../../../services/inventory/product.service"
import { LuSlidersHorizontal, LuInfo, LuPackage } from "react-icons/lu"
import { adminSurface } from "../adminPageUi"
import { useTranslation } from "react-i18next";

function StockAdjustment() {
  const { t } = useTranslation();
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
      toast.error(t('product_is_required'))
      return
    }
    if (!form.reason) {
      toast.error(t('reason_is_required'))
      return
    }

    const quantity = Number(form.quantity)
    if (form.adjustmentType === "SET_EXACT") {
      if (quantity < 0 || !Number.isFinite(quantity)) {
        toast.error(t('quantity_cannot_be_negative'))
        return
      }
    } else {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        toast.error(t('qty_greater_than_0'))
        return
      }
    }

    if (newStock !== null && newStock < 0) {
      toast.error(t('decrease_cannot_make_stock_below_0'))
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
      toast.success(t('stock_adjusted_success'))
      navigate("/admin/inventory")
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || t('unable_to_update_stock'))
    } finally {
      setIsLoading(false)
    }
  }

  const quantityLabel = () => {
    if (form.adjustmentType === "INCREASE") return t('quantity_to_add');
    if (form.adjustmentType === "DECREASE") return t('quantity_to_remove');
    return t('new_final_stock');
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <nav className="mb-2 flex items-center gap-2 text-sm text-[#64748b] dark:text-[#a1a1aa]">
        <Link to="/admin/inventory" className="hover:text-[#06b6d4]">{t('inventory')}</Link>
        <span className="text-[#64748b] dark:text-[#a1a1aa]">&gt;</span>
        <span className="font-semibold text-[#020617] dark:text-[#f8fafc]">{t('stock_adjustment')}</span>
      </nav>
      <div className={adminSurface.header}>
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 dark:bg-[#06b6d4]/20 text-cyan-600 dark:text-[#06b6d4] border border-cyan-200 dark:border-[#06b6d4]/50">
              <LuSlidersHorizontal size={20} />
            </div>
            <div>
              <p className={adminSurface.eyebrow}>
                {t('inventory_management')}
              </p>
              <h1 className={adminSurface.title}>
                {t('stock_adjustment')}
              </h1>
            </div>
          </div>
          <p className={adminSurface.description}>
            {t('stock_adjustment_desc')}
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
              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">{t('current_stock')}</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  className={`${adminSurface.input} w-full bg-slate-50 opacity-80 cursor-not-allowed`}
                  value={selectedProduct ? currentStock : ""}
                  placeholder=""
                />
              </div>

              {selectedProduct && selectedProduct.unitConfig && (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">{t('input_unit')}</label>
                  <select
                    className={`${adminSurface.select} w-full`}
                    value={form.inputUnit}
                    onChange={(e) => setForm({ ...form, inputUnit: e.target.value })}
                  >
                    <option value="">{t('default_unit')} ({selectedProduct.unitConfig.baseUnit?.nameKh || 'Unit'})</option>
                    {selectedProduct.unitConfig.baseUnit && (
                      <option value={selectedProduct.unitConfig.baseUnit.code}>
                        {selectedProduct.unitConfig.baseUnit.nameKh} ({t('base_unit')})
                      </option>
                    )}
                    {selectedProduct.unitConfig.purchaseUnit && (
                      <option value={selectedProduct.unitConfig.purchaseUnit.code}>
                        {selectedProduct.unitConfig.purchaseUnit.nameKh} ({selectedProduct.unitConfig.unitsPerPurchaseUnit} {t('base_units')})
                      </option>
                    )}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">{t('adjustment_type')}</label>
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
                  placeholder={t('enter_quantity')}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A9A6BB]">{t('reason')}</label>
                <select
                  required
                  className={`${adminSurface.select} w-full`}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                >
                  <option value="" disabled>{t('select_reason')}</option>
                  <option value="Expired">{t('expired')}</option>
                  <option value="Damaged">{t('damaged')}</option>
                  <option value="Lost">{t('lost')}</option>
                  <option value="Physical count correction">{t('physical_count_correction')}</option>
                  <option value="Return from customer">{t('return_from_customer')}</option>
                  <option value="Other">{t('other')}</option>
                </select>
              </div>
            </div>

            {selectedProduct && form.quantity !== "" && (
              <div className="mt-6 rounded-xl border border-slate-200 dark:border-[#2A2E36] bg-slate-50 dark:bg-[#111318] p-4 flex items-center justify-between text-sm shadow-sm">
                <div className="text-center flex-1">
                  <p className="text-slate-500 dark:text-[#A9A6BB] mb-1 font-medium">{t('current_stock')}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">{currentStock} {selectedProduct.unitConfig?.baseUnit?.nameKh || ""}</p>
                </div>
                <div className="text-center flex-1 border-x border-slate-200 dark:border-[#2A2E36]">
                  <p className="text-slate-500 dark:text-[#A9A6BB] mb-1 font-medium">{t('change_base')}</p>
                  <p className={`text-xl font-bold ${form.adjustmentType === 'DECREASE' ? 'text-red-500' : form.adjustmentType === 'INCREASE' ? 'text-emerald-500' : 'text-cyan-500'}`}>
                    {form.adjustmentType === "DECREASE" ? "-" : form.adjustmentType === "INCREASE" ? "+" : ""}
                    {form.adjustmentType === "SET_EXACT" ? (newStock - currentStock > 0 ? `+${newStock - currentStock}` : newStock - currentStock) : convertedQty}
                    {" "}{selectedProduct.unitConfig?.baseUnit?.nameKh || ""}
                  </p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-slate-500 dark:text-[#A9A6BB] mb-1 font-medium">{t('new_final_stock')}</p>
                  <p className={`text-xl font-bold ${newStock < 0 ? 'text-red-500' : 'text-slate-900 dark:text-[#F8FAFC]'}`}>{newStock} {selectedProduct.unitConfig?.baseUnit?.nameKh || ""}</p>
                </div>
              </div>
            )}
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
              disabled={isLoading || !form.productId || form.quantity === "" || !form.reason || (newStock !== null && newStock < 0)}
              className={adminSurface.primaryButton}
            >
              {isLoading ? t('processing') : t('confirm_adjustment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockAdjustment
