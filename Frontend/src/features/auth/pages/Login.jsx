import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import FormGroup from "../components/FormGroup"
import "../styles/login.scss"

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [localError, setLocalError] = useState("")

    async function handleSubmit(e) {
        e.preventDefault()
        setLocalError("")

        if (!identifier.trim() || !password) {
            setLocalError("Please enter your email/username and password")
            return
        }

        try {
            const isEmail = identifier.includes("@")
            await handleLogin({
                email: isEmail ? identifier : undefined,
                username: isEmail ? undefined : identifier,
                password
            })
            navigate("/")
        } catch (err) {
            setLocalError(err.message || "Failed to log in")
        }
    }

    return (
        <main className="login-page">
            <div className="form-container">
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 14px",
                        background: "rgba(245, 158, 11, 0.12)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        borderRadius: "20px",
                        fontSize: "0.82rem",
                        color: "#f59e0b",
                        fontWeight: 600,
                        marginBottom: "12px"
                    }}>
                        🎵 Mood-Based Music Experience
                    </div>
                    <h1>Welcome Back</h1>
                    <p style={{ margin: "6px 0 0", color: "#8a90a3", fontSize: "0.88rem" }}>
                        Log in to tune into your mood
                    </p>
                </div>

                {localError && (
                    <div style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        color: "#fca5a5",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        marginBottom: "16px",
                        textAlign: "center"
                    }}>
                        {localError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <FormGroup
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        label="Email or Username"
                        placeholder="Enter email or username"
                        required
                    />
                    <FormGroup
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        required
                    />

                    <button type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p>
                    Don't have an account? <Link to="/register">Register Here</Link>
                </p>
            </div>
        </main>
    )
}

export default Login