import { useState } from "react"
import { api } from "../configs/api"
import toast from "react-hot-toast"
import { formatApiError } from "../utils/formatApiError"

const useAddPaymentSale = () => {
    const [isLoading, setIsLoading] = useState(false)

    const addPayment = async (id, data) => {
        try {
            setIsLoading(true)
            const res = await api.patch(`/sales/addPayment/${id}`, data)
            return res.data
        } catch (error) {
            const msg = formatApiError(error)
            toast.error(msg)
            console.error("Payment Error (Sale) Details:", error.response?.data || error.message, error);
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return {
        addPayment,
        isLoading
    }
}

export default useAddPaymentSale
