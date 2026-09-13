import { createContext, useState, useEffect } from "react"
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout } from "./services/auth.api"

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Check existing auth session on app startup
    useEffect(() => {
        let isMounted = true

        async function verifySession() {
            const token = localStorage.getItem("modify_token")
            try {
                const data = await getMe()
                if (isMounted && data?.user) {
                    setUser(data.user)
                }
            } catch (err) {
                // If token invalid or no session, cleanly set user to null
                if (isMounted) {
                    setUser(null)
                    if (token) localStorage.removeItem("modify_token")
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        verifySession()

        return () => {
            isMounted = false
        }
    }, [])

    const handleLogin = async ({ email, username, password }) => {
        setLoading(true)
        setError(null)
        try {
            const data = await apiLogin({ email, username, password })
            setUser(data.user)
            return data
        } catch (err) {
            const msg = err.response?.data?.message || "Login failed. Please check your credentials."
            setError(msg)
            throw new Error(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        setError(null)
        try {
            const data = await apiRegister({ username, email, password })
            setUser(data.user)
            return data
        } catch (err) {
            const msg = err.response?.data?.message || "Registration failed. Please try again."
            setError(msg)
            throw new Error(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await apiLogout()
        } catch (err) {
            console.warn("Logout warning:", err)
        } finally {
            setUser(null)
            setLoading(false)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                error,
                setError,
                handleLogin,
                handleRegister,
                handleLogout,
                isAuthenticated: !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}