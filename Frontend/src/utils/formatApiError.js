export const formatApiError = (error) => {
    if (!error) return "Server Error"

    const payload = error?.response?.data ?? error

    if (Array.isArray(payload)) {
        return payload
            .map((el) => {
                if (typeof el === "string") return el
                if (typeof el === "object" && el !== null) {
                    return `${el.path || "Error"}: ${el.message || JSON.stringify(el)}`
                }
                return String(el)
            })
            .join(", ")
    }

    if (typeof payload === "object" && payload !== null) {
        if (typeof payload.error !== "undefined") return formatApiError(payload.error)
        if (typeof payload.message === "string") return payload.message
        if (typeof payload.message !== "undefined") return JSON.stringify(payload.message)
        if (typeof payload.errors !== "undefined") return formatApiError(payload.errors)
        return JSON.stringify(payload)
    }

    return String(payload)
}
