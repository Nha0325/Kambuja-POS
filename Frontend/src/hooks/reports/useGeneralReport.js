import { useState, useEffect } from "react"
import { api } from "../../utils/config/api"

export const useGeneralReport = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/report/general`)
        if (res.data?.success) {
          setData(res.data?.result)
        }
      } catch (error) {
        console.error('Failed to fetch data by id', error?.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    data,
    isLoading
  }
}