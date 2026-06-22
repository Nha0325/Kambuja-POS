import axios from "axios";
import { apiUrl } from "./env";

export const api = axios.create({
    baseURL: `${apiUrl}`,
    withCredentials: true
})

const notifyUnauthorized = () => {
    if (typeof window === "undefined") return

    const wasAuthenticated = window.localStorage.getItem("posAuth") === "true"
    window.localStorage.removeItem("posAuth")

    if (wasAuthenticated) {
        window.dispatchEvent(new CustomEvent("pos-auth-unauthorized"))
    }
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            notifyUnauthorized()
        }

        return Promise.reject(error)
    }
)
