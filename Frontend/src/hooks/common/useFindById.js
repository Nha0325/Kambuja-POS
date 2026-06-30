import { useEffect, useState } from "react"
import { api } from "../../utils/config/api"

export const useFindById = (collection, id) => {

    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    
    const fetchData = async () => {
        setIsLoading(true)
        try {
            const res = await api.get(`/${collection}/${id}`)
            if(res.data?.success){
                setData(res.data?.result)
            }
        } catch (error) {
            console.error("Failed to fetch data by id",error.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [collection,id])
    
        return {
            data,
            isLoading,
            refetch: fetchData
        }

}