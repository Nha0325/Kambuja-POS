import { useState } from "react"
import { api } from "../configs/api"
import { formatApiError } from "../utils/formatApiError"
import toast from "react-hot-toast"

export const useSaleReport = () => {
    const [isLoading, setIsLoading] = useState(false)

    const fetchSaleReport = async (startDate, endDate) => {
        try {
            setIsLoading(true)
            // Pass dates as query parameters
            const res = await api.get(`/report/sale`, {
                params: { startDate, endDate }
            })
            return res.data
        } catch (error) {
            const msg = formatApiError(error)
            toast.error(msg)
        } finally {
            setIsLoading(false)
        } 
    } 

    return {
        isLoading,
        fetchSaleReport
    }
}