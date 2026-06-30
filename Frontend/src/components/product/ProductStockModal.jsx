import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { adminService } from "../../services/users/admin.service";
import { supplierService } from "../../services/purchase/supplier.service";
import { LuX, LuPackagePlus, LuSlidersHorizontal } from "react-icons/lu";

export default function ProductStockModal({ isOpen, onClose, product, mode, onSuccess }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  const [form, setForm] = useState({
    quantity: "",
    adjustmentType: "INCREASE",
    reason: "",
    supplierId: "",
    costPerPurchaseUnit: "",
    invoiceNo: "",
    receivedDate: new Date().toISOString().split('T')[0],
    note: ""
  });

  useEffect(() => {
    if (isOpen && mode === "IN") {
      supplierService.list({ page: 1, limit: 100 })
        .then((response) => setSuppliers(response.data.result || []));
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (isOpen && product) {
      setForm((prev) => ({
        ...prev,
        quantity: "",
        adjustmentType: "INCREASE",
        reason: "",
        supplierId: product.supplier?._id || product.supplier || "",
        costPerPurchaseUnit: product.pricing?.costPerPurchaseUnit || product.costPrice || "",
        invoiceNo: "",
        note: ""
      }));
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const currentStock = Number(product.stock ?? product.currentStock ?? 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(form.quantity);
    if (!Number.isFinite(qty) || (mode === "ADJUST" && form.adjustmentType !== "SET_EXACT" && qty <= 0) || (mode === "IN" && qty <= 0)) {
      toast.error(t("qty_greater_than_0"));
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "IN") {
        const payload = {
          productId: product._id,
          quantityPurchaseUnit: qty,
          quantity: qty,
          unitsPerPurchaseUnit: 1,
          totalBaseQty: qty,
          supplierId: form.supplierId || undefined,
          costPerPurchaseUnit: form.costPerPurchaseUnit ? Number(form.costPerPurchaseUnit) : undefined,
          totalCost: form.costPerPurchaseUnit ? Number(form.costPerPurchaseUnit) * qty : 0,
          invoiceNo: form.invoiceNo,
          receivedDate: form.receivedDate,
          note: form.note,
        };
        await adminService.receiveStock(payload);
        toast.success(t("stock_received_success"));
      } else {
        if (!form.reason) {
          toast.error(t("reason_is_required"));
          setIsLoading(false);
          return;
        }
        let newStock = currentStock;
        if (form.adjustmentType === "INCREASE") newStock += qty;
        if (form.adjustmentType === "DECREASE") newStock -= qty;
        if (form.adjustmentType === "SET_EXACT") newStock = qty;

        if (newStock < 0) {
          toast.error(t("decrease_cannot_make_stock_below_0"));
          setIsLoading(false);
          return;
        }

        const payload = {
          productId: product._id,
          type: "STOCK_ADJUSTMENT",
          adjustmentType: form.adjustmentType,
          quantity: qty,
          previousStock: currentStock,
          newStock,
          reason: form.reason,
          note: form.note,
        };
        await adminService.adjustStock(payload);
        toast.success(t("stock_adjusted_success"));
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || t("unable_to_update_stock"));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-[#2A2E36] dark:bg-[#111318] dark:text-[#f8fafc] dark:focus:border-[#06b6d4] dark:focus:ring-[#06b6d4]/20";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A2E36] px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 dark:bg-[#06b6d4]/20 text-cyan-600 dark:text-[#06b6d4]">
              {mode === "IN" ? <LuPackagePlus size={20} /> : <LuSlidersHorizontal size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                {mode === "IN" ? t("receive_stock") : t("stock_adjustment")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#A9A6BB]">{product.name} ({t("current_stock")}: {currentStock})</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#2A2E36] transition-colors">
            <LuX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            {mode === "IN" && (
              <>
                <div>
                  <label className={labelClass}>{t("quantity_to_add")}</label>
                  <input required type="number" min="1" className={inputClass} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>{t("supplier")}</label>
                  <select className={inputClass} value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}>
                    <option value="">{t("no_supplier_direct")}</option>
                    {suppliers.map(s => <option key={s._id} value={s._id}>{s.businessName || s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t("cost_per_purchase_unit_optional")}</label>
                  <input type="number" step="0.01" className={inputClass} value={form.costPerPurchaseUnit} onChange={e => setForm({ ...form, costPerPurchaseUnit: e.target.value })} />
                </div>
              </>
            )}

            {mode === "ADJUST" && (
              <>
                <div>
                  <label className={labelClass}>{t("adjustment_type")}</label>
                  <select required className={inputClass} value={form.adjustmentType} onChange={e => setForm({ ...form, adjustmentType: e.target.value })}>
                    <option value="INCREASE">INCREASE (+)</option>
                    <option value="DECREASE">DECREASE (-)</option>
                    <option value="SET_EXACT">SET_EXACT</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{form.adjustmentType === "SET_EXACT" ? t("new_final_stock") : t("quantity")}</label>
                  <input required type="number" min="0" className={inputClass} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>{t("reason")}</label>
                  <select required className={inputClass} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}>
                    <option value="" disabled>{t("select_reason")}</option>
                    <option value="Expired">{t("expired")}</option>
                    <option value="Damaged">{t("damaged")}</option>
                    <option value="Lost">{t("lost")}</option>
                    <option value="Physical count correction">{t("physical_count_correction")}</option>
                    <option value="Return from customer">{t("return_from_customer")}</option>
                    <option value="Other">{t("other")}</option>
                  </select>
                </div>
              </>
            )}
            
            <div>
              <label className={labelClass}>{t("note")}</label>
              <textarea className={`${inputClass} min-h-[80px] py-3 resize-none`} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-[#2A2E36] bg-slate-50 dark:bg-[#111318] px-5 py-4 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 dark:border-[#2A2E36] bg-white dark:bg-[#1A1D22] px-4 py-2 text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] transition hover:bg-slate-50 dark:hover:bg-[#2A2E36] min-h-11 shadow-sm">
              {t("cancel")}
            </button>
            <button type="submit" disabled={isLoading} className="rounded-xl bg-cyan-600 dark:bg-[#06b6d4] px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 dark:hover:bg-[#0891b2] min-h-11 shadow-sm disabled:opacity-60">
              {isLoading ? t("processing") : t("confirm")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
