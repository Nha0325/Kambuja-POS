import { useEffect, useState } from "react"
import { api } from "../configs/api"

const useFetchData = (collection, page = 1, limit =25, search="", refetch = false, condition="") => {
    const [data, setData] = useState([])
    const [totalPage, setTotalPage] = useState(0)
    const [total, setTotal] = useState(0)
    const [totalWithNotes, setTotalWithNotes] = useState(0)
    const [meta, setMeta] = useState(null)
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
                setTotal(res.data.total || res.data.result?.length || 0)
                setTotalWithNotes(res.data.totalWithNotes || 0)
                setMeta(res.data)
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
                        setTotal(altRes.data.total || altRes.data.result?.length || 0)
                        setTotalWithNotes(altRes.data.totalWithNotes || 0)
                        setMeta(altRes.data)
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
        isLoading,
        total,
        totalWithNotes,
        meta
    }
}

export default useFetchData
