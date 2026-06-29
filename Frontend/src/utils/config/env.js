const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"
const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, "")

export {
    apiUrl,
    baseUrl
}
