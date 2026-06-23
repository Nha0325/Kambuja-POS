import { useState } from "react"
import { api } from "../../configs/api"
import toast from "react-hot-toast"
import { formatApiError } from "../../utils/formatApiError"

export const useSignin = () => {

    const [isLoading, setIsLoading] = useState(false)

    const signin = async (email, password) => {
        try {
            setIsLoading(true)
            const res = await api.post('/auth/signin',{email, password})
            if (res.data?.success) {
                localStorage.setItem("posAuth", "true")
            }
            return res.data
        } catch (error) {
            const msg = formatApiError(error)
            toast.error(msg)
        } finally{
            setIsLoading(false)
        }

    }
    return {
        isLoading,
        signin
    }

}

export default useSignin
