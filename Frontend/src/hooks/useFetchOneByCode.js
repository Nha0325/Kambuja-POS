import toast from "react-hot-toast"
import { api } from "../configs/api"
import { formatApiError } from "../utils/formatApiError"

const useFetchOneByCode = () => {
    const fetchData = async (path, code) => {
        const url = `${path}/${code}`
        try{
            const {data} = await api.get(url)
            if(data.success){
                return data.result
            }
        }catch(error){
            const msg = formatApiError(error)
            toast.error(msg)
        }
    }
    return {
        fetchData
    }
}

export default useFetchOneByCode