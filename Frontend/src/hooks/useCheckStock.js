import toast from "react-hot-toast";
import { api } from "../configs/api";
import { formatApiError } from "../utils/formatApiError"

export const useCheckStock = () => {
  const checkStock = async (product, stock) => {
    try {
      const res = await api.get(
        `/sales/checkStock?product=${product}&stock=${stock}`
      );
      return res.data
    } catch (error) {
      const msg = formatApiError(error)
      toast.error(msg)
    }
  }

  return {
    checkStock,
  }
}
