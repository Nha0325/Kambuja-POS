import { useEffect, useState } from "react"
import { api } from "../configs/api"

const useFetchData = (collection, page = 1, limit =25, search="", refetch = false, condition="") => {
    const [data, setData] = useState([])
    const [totalPage, setTotalPage] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const queryParts = []

    if (condition) {
        queryParts.push(condition)
    }
    queryParts.push(`page=${page}`)
    queryParts.push(`limit=${limit}`)
    queryParts.push(`search=${encodeURIComponent(search)}`)

    const queryString = queryParts.join("&")
    const path = `/${collection}?${queryString}`
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(path)
                setData(res.data.result)
                setTotalPage(res.data.totalPages || res.data.totalPage || 0)
            } catch (error) {
                // If the endpoint was not found, attempt a simple pluralization/singularization fallback
                const status = error?.response?.status
                if (status === 404) {
                    try {
                        const altCollection = collection.endsWith('s') ? collection.slice(0, -1) : `${collection}s`
                        const altPath = `/${altCollection}?${queryString}`
                        const altRes = await api.get(altPath)
                        setData(altRes.data.result)
                        setTotalPage(altRes.data.totalPages || altRes.data.totalPage || 0)
                        return
                    } catch (err) {
                        console.log('Fallback fetch failed:', err.message)
                    }
                }
                console.log(error.message)
            }finally{
                setIsLoading(false)
            }
        }
        fetchData()
    },[path, refetch, collection, queryString])

    return {
        data,
        totalPage,
        isLoading
    }
}

export default useFetchData
