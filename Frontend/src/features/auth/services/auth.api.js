import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

// Attach authorization token if stored in localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("modify_token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export async function register({ email, username, password }) {
    const response = await api.post("/api/auth/register", {
        email,
        password,
        username
    })
    if (response.data?.token) {
        localStorage.setItem("modify_token", response.data.token)
    }
    return response.data
}

export async function login({ email, username, password }) {
    const response = await api.post("/api/auth/login", {
        email,
        password,
        username
    })
    if (response.data?.token) {
        localStorage.setItem("modify_token", response.data.token)
    }
    return response.data
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me")
    return response.data
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        localStorage.removeItem("modify_token")
        return response.data
    } catch (err) {
        localStorage.removeItem("modify_token")
        return { message: "Logged out" }
    }
}

export default api
