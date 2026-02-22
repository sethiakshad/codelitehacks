export const BASE_URL = import.meta.env.VITE_API_URL || 'https://codelitehacks-production.up.railway.app'

const getToken = () => localStorage.getItem("token")

const request = async (endpoint, options = {}) => {
    const token = getToken()
    const isFormData = options.body instanceof FormData;
    const url = `${BASE_URL}${endpoint}`;
    console.log(`[API Request] ${options.method || 'GET'} ${url}`);

    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                ...(!isFormData && { "Content-Type": "application/json" }),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Request failed")
        return data
    } catch (err) {
        console.error(`[API Error] ${options.method || 'GET'} ${url}:`, err);
        throw err;
    }
}

export const api = {
    get: (url) => request(url),
    post: (url, body) => request(url, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
    put: (url, body) => request(url, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) }),
    delete: (url) => request(url, { method: "DELETE" }),
}
