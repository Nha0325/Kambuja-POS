import { useState } from "react"
import { api } from "../configs/api"

export const useStockReport = () => {
    const [isLoading, setIsLoading] = useState(false)
    const fetchStockReport = async (stock) => {
        try {
            setIsLoading(true)
            const res = await api.get(`/report/stock?stockQty=${stock}`)
            return res.data
        } catch (error) {
            console.log('Error: ', error)
        }finally{
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        fetchStockReport
    }
} 