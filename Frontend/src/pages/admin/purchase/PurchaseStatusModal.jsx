import { useEffect, useState } from "react";
import { useFindById as useFetchById } from "../../../hooks/common/useFindById";
import Modal from "../../../components/ui/Modal";
import useUpdatePurchaseStatus from "../../../hooks/purchase/useUpdatePurchaseStatus";
import toast from "react-hot-toast";

function PurchaseStatusModal({ open, onClose, editId }) {
  const { data, isLoading } = useFetchById("purchases", editId);
  const [purchaseStatus, setPurchaseStatus] = useState("");

  const { updateStatus, isLoading: isUpdating } = useUpdatePurchaseStatus();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId) {
      toast.error("Purchase ID is missing!");
      return;
    }
    try {
      const res = await updateStatus(editId, purchaseStatus);
      if(res){
          toast.success("Status updated successfully!");
          onClose();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status.");
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
        title="Update Purchase Status"
        open={open}
        onClose={() => {
          onClose();
          setPurchaseStatus("");
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.04em] text-[#64748b] dark:text-[#a1a1aa] mb-2">Status</label>
            <select
              required
              className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] outline-none transition focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc]"
              disabled={isLoading || isUpdating}
              value={purchaseStatus}
              onChange={(e) => setPurchaseStatus(e.target.value)}
            >
              <option value="" disabled>
                Select Purchase Status
              </option>
              <option value="received">Received</option>
              <option value="pending">Pending</option>
              <option value="ordered">Ordered</option>
            </select>
          </div>

          <button 
            disabled={isUpdating || isLoading} 
            type="submit" 
            className="mt-4 bg-[#06b6d4] text-white hover:bg-[#0891b2] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex items-center justify-center h-10 w-full"
          >
            {isUpdating ? "Updating..." : "Save Status"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default PurchaseStatusModal;
