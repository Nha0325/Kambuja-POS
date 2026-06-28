import { useEffect, useState } from "react";
import { api } from "../../utils/config/api";

export const useQuery = (collection,search="", page = 1, limit = 10, refetch = false) => {
    const [data, setData] = useState([])
    const [totalPage, setTotalPage] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/${collection}?search=${search}&page=${page}&limit=${limit}`)
                if(res.data?.success){
                    setData(res.data?.result)
                    setTotalPage(res.data?.totalPages || res.data?.totalPage || 0)
                }
                
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [collection, search, limit, page, refetch])

    return {
        data,
        totalPage,
        isLoading
    }

}
