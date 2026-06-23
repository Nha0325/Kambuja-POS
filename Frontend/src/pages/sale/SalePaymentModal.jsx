import { useEffect, useState } from "react";
import useFetchOne from "../../hooks/useFetchOne";
import Modal from "../../components/Modal";
import useAddPaymentSale from "../../hooks/useAddPaymentSale";
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
        <form onSubmit={handleSubmit}>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
            <div className="flex justify-between">
              <span>Total Cost:</span>
              <span className="font-bold">${Number(data?.totalCost || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-700">
              <span>Already Paid:</span>
              <span className="font-bold">${Number(data?.paidAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Paid Amount ($)</label>
            <input 
              onChange={(e) => setPaidAmount(e.target.value)} 
              value={paidAmount} 
              disabled={isSaving}
              type="number" 
              className="input input-sm input-bordered w-full" 
            />
          </div>
          <div className="mb-4 space-y-2">
            <div className="text-red-600 font-semibold">Due: ${dueAmount.toFixed(2)}</div>
            <div className="text-green-600 font-semibold">Change: ${changeAmount.toFixed(2)}</div>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-neutral w-full"
          >
            {isSaving ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Save"
            )}
          </button>
        </form>
        )}
    </Modal>
  );
}
export default SalePaymentModal;