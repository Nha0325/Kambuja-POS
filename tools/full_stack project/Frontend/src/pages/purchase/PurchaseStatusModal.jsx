import { useEffect, useState } from "react";
import { useFindById as useFetchById } from "../../hooks/useFindById";
import Modal from "../../components/Modal";
import useUpdatePurchaseStatus from "../../hooks/useUpdatePurchaseStatus";
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
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              required
              className="select w-full select-bordered"
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
            className="btn btn-neutral w-full"
          >
            {isUpdating ? "Updating..." : "Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default PurchaseStatusModal;
