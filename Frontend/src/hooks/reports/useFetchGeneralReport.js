import { useEffect, useState } from "react"
import { api } from "../../utils/config/api"

const useFetchGeneralReport = () => {
    const [data, setData] = useState([])
    const [isLoading,setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try{
                const res = await api.get('/report/general')
                if(res.data.success){
                    setData(res.data.result)
                }

            }catch(error){
                if (error?.response?.status !== 401) {
                    console.error("Failed to fetch general report", error?.response?.data || error.message)
                }
            }finally{
                setIsLoading(false)
            }
        }

        fetchData()
    },[])

    return{
        data,
        isLoading
    }
}

export default useFetchGeneralReport
