import toast from "react-hot-toast"
import { api } from "../../configs/api"
import { formatApiError } from "../../utils/formatApiError"
import { useState } from "react"

const useSignup = () => {
    const [isLoading, setIsLoading] = useState(false)

    const signup = async (data) => {
        try{
            setIsLoading(true)
            const res = await api.post("/auth/signup", data)
            return res.data
        }catch(error){
            const msg = formatApiError(error)
            toast.error(msg)
        }finally{
            setIsLoading(false)
        }
    }

    return {
        signup, isLoading
    }
}

export default useSignup