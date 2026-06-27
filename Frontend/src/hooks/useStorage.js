import toast from "react-hot-toast";
import { api } from "../configs/api"
import { formatApiError } from "../utils/formatApiError"

const useStorage = () => {

    const uploadFile = async (file) => {
        try {
            const res = await api.postForm('/upload', {
                imageUrl: file
            });
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