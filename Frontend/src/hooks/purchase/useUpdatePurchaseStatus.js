import { api } from "../../utils/config/api";
import { useState } from "react";
import toast from "react-hot-toast";
import { formatApiError } from "../../utils/formatters/formatApiError";

const useUpdatePurchaseStatus = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (id, purchaseStatus) => {
    try {
      const nextStatus =
        typeof purchaseStatus === "object"
          ? purchaseStatus?.purchaseStatus
          : purchaseStatus;

      if (!nextStatus) {
        const errorMsg = "Please select a valid status.";
        toast.error(errorMsg);
        return;
      }

      setIsLoading(true);
      // Targets the specific status update endpoint
      const res = await api.patch(`/purchases/updatePurchaseStatus/${id}`, {
        purchaseStatus: nextStatus,
      });
      return res.data;
    } catch (error) {
      const msg = formatApiError(error);
      toast.error(msg); // Log the actual error object for debugging
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateStatus, isLoading };
};

export default useUpdatePurchaseStatus;
