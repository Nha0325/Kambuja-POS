import { useState } from "react"
import { api } from "../../utils/config/api"
import toast from "react-hot-toast"
import { formatApiError } from "../../utils/formatters/formatApiError"

export const useSignin = () => {

    const [isLoading, setIsLoading] = useState(false)

    const signin = async (email, password) => {
        try {
            setIsLoading(true)
            const res = await api.post('/auth/signin',{email, password})
            if (res.data?.success) {
                const accessToken = res.data?.data?.accessToken || res.data?.result?.token;
                const user = res.data?.data?.user || res.data?.result;
                
                if (accessToken) {
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("token", accessToken); // For backward compatibility
                }
                if (user) {
                    localStorage.setItem("user", JSON.stringify(user));
                }
                
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
