import toast from "react-hot-toast";
import { api } from "../configs/api"
import { formatApiError } from "../utils/formatApiError"

const useStorage = () => {

    const uploadFile = async (file) => {
        try {
            const formData = new FormData();
            formData.append("imageUrl", file);
            const res = await api.post('/upload',formData)
            return res.data
        } catch (error) {
            const msg = formatApiError(error)
            toast.error(msg)
        }
    }

    const removeFile = async (imageName) => {
        try {
            const res = await api.delete(`/upload/${imageName}`)
            return res.data
        } catch (error) {
            const msg = formatApiError(error)
            toast.error(msg)
        }
    }

    return {
        uploadFile,
        removeFile
    }
}

export default useStorage