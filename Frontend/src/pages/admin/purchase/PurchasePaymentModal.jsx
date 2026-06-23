import { useEffect, useState } from "react";
import useFetchOne from "../../../hooks/useFetchOne";
import Modal from "../../../components/Modal";
import useAddPaymentPurchase from "../../../hooks/useAddPaymentPurchase";
import toast from "react-hot-toast";

function PurchasePaymentModal({ open, editId, onClose }) {
  const { data, isLoading } = useFetchOne("purchases", editId);
  const [paidAmount, setPaidAmount] = useState("");
  const [changeAmount, setChangeAmount] = useState(0);
  const { addPayment, isLoading: isSaving } = useAddPaymentPurchase();

  useEffect(() => {
    if (open) {
      setPaidAmount("");
      setChangeAmount(0);
    }
  }, [open, editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId) {
      toast.error("Purchase ID is missing. Cannot add payment.");
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
      const res = await addPayment(editId, {
        paidAmount: amount,
      });
      if (res) {
        toast.success("Add payment successfully!");
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
        title="Add Payment"
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
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Paid Amount ($)</label>
            <input
              onChange={(e) => setPaidAmount(e.target.value)}
              value={paidAmount}
              type="number"
              className="input input-bordered w-full"
              placeholder="Enter amount in $"
            />
          </div>
          
          <div className="mb-4 space-y-2">
            <button
              type="button"
              onClick={() => setPaidAmount(data?.dueAmount || 0)}
              disabled={isSaving}
              className="btn block btn-sm btn-ghost border border-gray-200 w-full text-left justify-between px-3"
            >
              <span>Due Amount:</span>
              <span className="text-red-600 font-semibold">${Number(data?.dueAmount || 0).toFixed(2)}</span>
            </button>
            
            <div className="flex justify-between items-center btn-sm px-3 bg-gray-50 rounded-lg text-gray-700">
              <span>Remaining Due:</span>
              <span className="text-orange-600 font-semibold">
                ${Math.max(0, (data?.totalCost || 0) - ((data?.paidAmount || 0) + Number(paidAmount || 0))).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center btn-sm px-3 bg-gray-50 rounded-lg text-gray-700">
              <span>Change Amount:</span>
              <span className="text-green-600 font-semibold">
                ${Number(changeAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
          
          <button type="submit" disabled={isSaving} className="btn btn-neutral w-full">
            {isSaving ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Save Payment"
            )}
          </button>
        </form>
        )}
      </Modal>
    </div>
  );
}

export default PurchasePaymentModal;
