import { useState } from "react"
import { api } from "../../utils/config/api"

export const useStockReport = () => {
    const [isLoading, setIsLoading] = useState(false)
    const fetchStockReport = async (params = {}) => {
        try {
            setIsLoading(true)
            const res = await api.get('/report/stock', { params })
            return res.data
        } catch (error) {
            console.log('Error: ', error)
            return { success: false, error: error.message }
        }finally{
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        fetchStockReport
    }
} 