import { useEffect, useState } from "react"
import { api } from "../../configs/api"
import toast from "react-hot-toast"
import { formatApiError } from "../../utils/formatApiError"

const useCurrent = () => {

    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState(null)

    useEffect(() => {
        const fetchData = async() => {
        if (localStorage.getItem("posAuth") !== "true") {
            setData(null)
            setIsLoading(false)
            return
        }
     
        try {
            const res = await api.get('/auth/me')
            if(res.data?.success){
                setData(res.data?.result)
            }
        } catch (error) {
            if (error?.response?.status === 401) {
                localStorage.removeItem("posAuth")
            }
            if (error?.response?.status !== 401) {
                const msg = formatApiError(error)
                toast.error(msg)
            }
            setData(null)
        } finally{
            setIsLoading(false)
        }
    }
    fetchData()

    },[])

    return {
        isLoading,
        data
    }

}

export default useCurrent
