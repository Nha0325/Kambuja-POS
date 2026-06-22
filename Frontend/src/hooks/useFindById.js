import { useEffect, useState } from "react"
import { api } from "../configs/api"

export const useFindById = (collection, id) => {

    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    
        useEffect(() => {
            const fetchData = async () => {
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
            fetchData()
        }, [collection,id])
    
        return {
            data,
            isLoading
        }

}