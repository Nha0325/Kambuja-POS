import { useEffect, useState } from "react";
import useFetchOne from "../../../hooks/common/useFetchOne";
import Modal from "../../../components/ui/Modal";
import useAddPaymentPurchase from "../../../hooks/purchase/useAddPaymentPurchase";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function PurchasePaymentModal({ open, editId, onClose }) {
  const { data, isLoading } = useFetchOne("purchases", editId);
  const [paidAmount, setPaidAmount] = useState("");
  const [changeAmount, setChangeAmount] = useState(0);
  const { addPayment, isLoading: isSaving } = useAddPaymentPurchase();
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      setPaidAmount("");
      setChangeAmount(0);
    }
  }, [open, editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId) {
      toast.error(t('purchase_id_missing'));
      return;
    }
    if (!data || isLoading || isSaving) {
      return;
    }

    const amount = Math.round(parseFloat(paidAmount));
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error(t('enter_valid_amount'));
      return;
    }

    try {
      const res = await addPayment(editId, {
        paidAmount: amount,
      });
      if (res) {
        toast.success(t('add_payment_success'));
        setPaidAmount("");
        onClose();
      }
    } catch (error) {
      console.error("Payment Error:", error);
    }
  };

  useEffect(() => {
    if (data) {
      const currentPaid = Number(data?.paidAmount || 0);
      const newPaid = Number(paidAmount || 0);
      const totalCost = Number(data?.totalCost || 0);
      
      const change = Math.max(0, (currentPaid + newPaid) - totalCost);
      
      setChangeAmount(change);
    }
  }, [data, paidAmount]);

  return (
    <div>
      <Modal
        size="md"
        title={t('add_payment')}
        open={open}
        onClose={() => {
          setPaidAmount("");
          setChangeAmount(0);
          onClose();
        }}
      >
        {isLoading || !data ? (
          <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.04em] text-[#64748b] dark:text-[#a1a1aa] mb-2">{t('paid_amount_usd')}</label>
            <input
              onChange={(e) => setPaidAmount(e.target.value)}
              value={paidAmount}
              type="number"
              className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
              placeholder={t('enter_amount_usd')}
            />
          </div>
          
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setPaidAmount(data?.dueAmount || 0)}
              disabled={isSaving}
              className="flex justify-between items-center w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm"
            >
              <span className="text-[#64748b] dark:text-[#a1a1aa] font-medium">{t('due_amount_label')}</span>
              <span className="text-red-500 font-bold">${Number(data?.dueAmount || 0).toFixed(2)}</span>
            </button>
            
            <div className="flex justify-between items-center w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] text-sm">
              <span className="text-[#64748b] dark:text-[#a1a1aa] font-medium">{t('remaining_due_label')}</span>
              <span className="text-orange-500 font-bold">
                ${Math.max(0, (data?.totalCost || 0) - ((data?.paidAmount || 0) + Number(paidAmount || 0))).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-[#f8fafc] dark:bg-[#09090b] text-sm">
              <span className="text-[#64748b] dark:text-[#a1a1aa] font-medium">{t('change_amount_label')}</span>
              <span className="text-green-500 font-bold">
                ${Number(changeAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
          
          <button type="submit" disabled={isSaving} className="mt-4 bg-[#06b6d4] text-white hover:bg-[#0891b2] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex items-center justify-center h-10 w-full">
            {isSaving ? t('saving') : t('save_payment')}
          </button>
        </form>
        )}
      </Modal>
    </div>
  );
}

export default PurchasePaymentModal;
