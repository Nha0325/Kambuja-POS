import { useEffect, useState } from "react"
import { api } from "../configs/api"
import toast from "react-hot-toast"
import { formatApiError } from "../utils/formatApiError"

const useFetchOne = (collection, id) => {
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const path = `/${collection}/${id}`

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const res = await api.get(path)
                setData(res.data.result)
            } catch (error) {
                const msg = formatApiError(error)
                toast.error(msg)
                console.error("Fetch One Error:", error.response?.data || error.message)
            }finally{
                setIsLoading(false)
            }
        }
        fetchData()
    },[id, path])

    return {
        data,
        isLoading
    }
}

export default useFetchOne
