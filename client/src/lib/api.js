const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

const getToken = () => localStorage.getItem("token")

const request = async (endpoint, options = {}) => {
    const token = getToken()
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Request failed")
    return data
}

export const api = {
    get: (url) => request(url),
    post: (url, body) => request(url, { method: "POST", body: JSON.stringify(body) }),
    put: (url, body) => request(url, { method: "PUT", body: JSON.stringify(body) }),
    delete: (url) => request(url, { method: "DELETE" }),
}
