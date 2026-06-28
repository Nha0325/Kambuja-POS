import { useEffect, useState } from "react";
import useFetchOne from "../../../hooks/common/useFetchOne";
import Modal from "../../../components/ui/Modal";
import useAddPaymentSale from "../../../hooks/sales/useAddPaymentSale";
import toast from "react-hot-toast";

function SalePaymentModal({ open, editId, onClose }) {
  const { data, isLoading } = useFetchOne("sales", editId);
  const [paidAmount, setPaidAmount] = useState("");
  const [changeAmount, setChangeAmount] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);

  const { addPayment, isLoading: isSaving } = useAddPaymentSale();

  // Reset payment field when modal opens or ID changes
  useEffect(() => {
    if (open) {
      setPaidAmount("");
    }
  }, [open, editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId) {
      toast.error("Sale ID is missing. Cannot add payment.");
      return;
    }

    if (!data || isLoading || isSaving) {
      return;
    }

    const amount = Math.round(parseFloat(paidAmount));

    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount to pay.");
      return;
    }

    try {
      const res = await addPayment(String(editId), { paidAmount: amount }); 
      if (res) {
        toast.success("Add payment successfully!");
        setPaidAmount("");
        onClose();
      }
    } catch (error) {
      // The hook useAddPaymentSale already handles the error toast
      console.error("Submission error:", error);
    }
  };

  useEffect(() => {
    if (data) {
      const totalCost = parseFloat(data.totalCost) || 0;
      const currentPaid = parseFloat(data.paidAmount) || 0;
      const newPaid = parseFloat(paidAmount) || 0;
      
      const remainingDue = Math.max(0, totalCost - (currentPaid + newPaid));
      const change = Math.max(0, (currentPaid + newPaid) - totalCost);
      
      setDueAmount(remainingDue);
      setChangeAmount(change);
    } else {
      setDueAmount(0);
      setChangeAmount(0);
    }
  }, [data, paidAmount]);
  
  return (
    <Modal size="md" title={`Add Payment ${data?.invoiceNumber ? `- ${data.invoiceNumber}` : ""}`} open={open} onClose={onClose}>
        {isLoading || !data ? (
          <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4 p-3 bg-[#f8fafc] dark:bg-[#09090b] border border-[#e5e7eb] dark:border-[#27272a] rounded-lg text-sm space-y-2">
            <div className="flex justify-between text-[#64748b] dark:text-[#a1a1aa]">
              <span>Total Cost:</span>
              <span className="font-bold text-[#020617] dark:text-[#f8fafc]">${Number(data?.totalCost || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#64748b] dark:text-[#a1a1aa]">
              <span>Already Paid:</span>
              <span className="font-bold text-green-500">${Number(data?.paidAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.04em] text-[#64748b] dark:text-[#a1a1aa] mb-2">Paid Amount ($)</label>
            <input 
              onChange={(e) => setPaidAmount(e.target.value)} 
              value={paidAmount} 
              disabled={isSaving}
              type="number" 
              className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#020617] placeholder:text-slate-400 outline-none transition focus:border-[#7033ff] focus:ring-2 focus:ring-[#7033ff]/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27272a] dark:bg-[#09090b] dark:text-[#f8fafc] dark:placeholder:text-zinc-500"
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
              <span className="text-[#64748b] dark:text-[#a1a1aa] font-medium">Due:</span>
              <span className="text-red-500 font-bold">${dueAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center w-full px-3 py-2 rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#111113] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
              <span className="text-[#64748b] dark:text-[#a1a1aa] font-medium">Change:</span>
              <span className="text-green-500 font-bold">${changeAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-4 bg-[#7033ff] text-white hover:bg-[#5f27e6] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors flex items-center justify-center h-10 w-full"
          >
            {isSaving ? "Saving..." : "Save Payment"}
          </button>
        </form>
        )}
    </Modal>
  );
}
export default SalePaymentModal;