import toast from "react-hot-toast";
import { api } from "../../utils/config/api";
import { formatApiError } from "../../utils/formatters/formatApiError"

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
