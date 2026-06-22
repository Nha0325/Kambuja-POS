import { useState } from "react"
import { api } from "../configs/api"
import toast from "react-hot-toast"
import { formatApiError } from "../utils/formatApiError"

const useCollection = (collection) => {

    const path = `/${collection}`
    const [isLoading, setIsLoading] = useState(false)

    const create = async (data) => {
        try {
            setIsLoading(true)
            const res = await api.post(path, data)
            return res.data?.result || res.data
        } catch (error) {
            const msg = formatApiError(error)
            toast.error(msg)
            console.error("Create Error:", error.response?.data || error.message)
        }finally{
            setIsLoading(false)
        }
    }

    const update = async (id, data) => {
        try {
            setIsLoading(true)
            const res = await api.patch(`${path}/${id}`, data)
            return res.data.result
        } catch (error) {
            const msg = formatApiError(error)
            toast.error(msg)
            console.error("Update Error:", error.response?.data || error.message)
        }finally{
            setIsLoading(false)
        }
    }

    const remove = async (id) => {
        try {
            setIsLoading(true)
            const res = await api.delete(`${path}/${id}`)
            return res.data
        } catch (error) {
            const msg = formatApiError(error)
            toast.error(msg)
            console.error("Remove Error:", error.response?.data || error.message)
        }finally{
            setIsLoading(false)
        }
    }

    return {
        create, 
        update,
        remove,
        isLoading
    }

}

export default useCollection
export { useCollection }
