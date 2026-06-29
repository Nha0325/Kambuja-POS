import { useEffect, useState } from "react";
import { useFindById as useFetchById } from "../../../hooks/common/useFindById";
import Modal from "../../../components/ui/Modal";
import useUpdatePurchaseStatus from "../../../hooks/purchase/useUpdatePurchaseStatus";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function PurchaseStatusModal({ open, onClose, editId }) {
  const { data, isLoading } = useFetchById("purchases", editId);
  const [purchaseStatus, setPurchaseStatus] = useState("");

  const { updateStatus, isLoading: isUpdating } = useUpdatePurchaseStatus();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId) {
      toast.error(t('purchase_id_missing_2'));
      return;
    }
    try {
      const res = await updateStatus(editId, purchaseStatus);
      if(res){
          toast.success(t('status_updated_success'));
          onClose();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || t('failed_to_update_status'));
    }
  };

  useEffect(() => {
    if(data){
        setPurchaseStatus(data?.purchaseStatus)
    }
  },[data])

  return (
    <div>
      <Modal
        size="md"
        title={t('update_purchase_status')}
        open={open}
        onClose={() => {
          onClose();
          setPurchaseStatus("");
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.04em] text-[#64748b] dark:text-[#a1a1aa] mb-2">{t('status')}</label>
            <select
              required
              className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc]"
              disabled={isLoading || isUpdating}
              value={purchaseStatus}
              onChange={(e) => setPurchaseStatus(e.target.value)}
            >
              <option value="" disabled>
                {t('select_purchase_status')}
              </option>
              <option value="received">{t('received')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="ordered">{t('ordered')}</option>
            </select>
          </div>

          <button 
            disabled={isUpdating || isLoading} 
            type="submit" 
            className="mt-4 bg-[#06b6d4] text-white hover:bg-[#0891b2] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex items-center justify-center h-10 w-full"
          >
            {isUpdating ? t('updating') : t('save_status')}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default PurchaseStatusModal;
