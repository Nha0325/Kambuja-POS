import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true // Backend uses cookies for auth (posAuth)
});

api.interceptors.request.use((config) => {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

const notifyUnauthorized = () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    const wasAuthenticated = window.localStorage.getItem("posAuth") === "true";
    window.localStorage.removeItem("posAuth");

    if (wasAuthenticated) {
        window.dispatchEvent(new CustomEvent("pos-auth-unauthorized"));
    }
};

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            notifyUnauthorized();
        } else if (error.response?.status === 403) {
            console.error("403 Forbidden - Access denied");
        } else if (!error.response) {
            console.error("Network Error - Unable to reach the server");
        } else if (error.response?.status >= 500) {
            console.error("Server Error - An unexpected error occurred on the server");
        }

        return Promise.reject(error);
    }
);

export default api;
