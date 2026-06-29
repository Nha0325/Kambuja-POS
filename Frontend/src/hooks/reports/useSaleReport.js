import { useState } from "react"
import { api } from "../../utils/config/api"
import { formatApiError } from "../../utils/formatters/formatApiError"
import toast from "react-hot-toast"

export const useSaleReport = () => {
    const [isLoading, setIsLoading] = useState(false)

    const fetchSaleReport = async (startDate, endDate) => {
        try {
            setIsLoading(true)
            const [saleRes, shiftRes] = await Promise.all([
                api.get(`/report/sale`, { params: { startDate, endDate } }),
                api.get(`/daily-close/history`, { params: { startDate, endDate } })
            ]);
            
            return {
                ...saleRes.data,
                shifts: shiftRes.data?.result || []
            };
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