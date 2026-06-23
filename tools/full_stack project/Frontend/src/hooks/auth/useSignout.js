import { useState } from "react"
import { api } from "../../configs/api"
import toast from "react-hot-toast"
import { formatApiError } from "../../utils/formatApiError"

const useSignout = () => {

    const [isLoading, setIsLoading] = useState(false)

    const signout = async() => {
        try {
            setIsLoading(true)
            const res = await api.get('/auth/signout',)
            localStorage.removeItem("posAuth")
            return res.data
        } catch (error) {
            if (error?.response?.status === 401) {
                localStorage.removeItem("posAuth")
            }
            const msg = formatApiError(error)
            toast.error(msg)
        } finally{
            setIsLoading(false)
        }

    }
    return {
        isLoading,
        signout
    }

}

export default useSignout
