import { createContext, useContext, useState, useEffect } from "react"
import { api, BASE_URL } from "../lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(() => localStorage.getItem("token"))
    const [loading, setLoading] = useState(true)

    // Load user from token on mount
    useEffect(() => {
        if (token) {
            api.get("/api/auth/me")
                .then(data => setUser(data.user))
                .catch(() => { localStorage.removeItem("token"); setToken(null) })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [token])

    const login = (newToken, userData) => {
        localStorage.setItem("token", newToken)
        setToken(newToken)
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
