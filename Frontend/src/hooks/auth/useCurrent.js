import { useEffect, useState } from "react"
import { api } from "../../utils/config/api"
import toast from "react-hot-toast"
import { formatApiError } from "../../utils/formatters/formatApiError"

const useCurrent = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState(null)

    useEffect(() => {
        let mounted = true;

        const fetchData = async() => {
            const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
            
            if (!token && localStorage.getItem("posAuth") !== "true") {
                if (mounted) {
                    setData(null)
                    setIsLoading(false)
                }
                return
            }
         
            try {
                const res = await api.get('/auth/me')
                if (res.data?.success && mounted) {
                    setData(res.data?.data || res.data?.result || null)
                }
            } catch (error) {
                if (error?.response?.status === 401) {
                    localStorage.removeItem("posAuth")
                    localStorage.removeItem("accessToken")
                    localStorage.removeItem("token")
                    localStorage.removeItem("user")
                }
                if (error?.response?.status !== 401 && error?.name !== 'CanceledError') {
                    const msg = formatApiError(error)
                    toast.error(msg)
                }
                if (mounted) {
                    setData(null)
                }
            } finally {
                if (mounted) {
                    setIsLoading(false)
                }
            }
        }
        
        fetchData()
        
        return () => {
            mounted = false;
        };
    }, [])

    return {
        isLoading,
        data
    }
}

export default useCurrent
