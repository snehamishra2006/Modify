import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import FormGroup from "../components/FormGroup"
import "../styles/register.scss"

const Register = () => {
    const { loading, handleRegister } = useAuth()
    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [localError, setLocalError] = useState("")

    async function handleSubmit(e) {
        e.preventDefault()
        setLocalError("")

        if (!username.trim() || !email.trim() || !password) {
            setLocalError("Please fill out all fields")
            return
        }

        if (password.length < 6) {
            setLocalError("Password must be at least 6 characters long")
            return
        }

        try {
            await handleRegister({ username, email, password })
            navigate("/")
        } catch (err) {
            setLocalError(err.message || "Failed to create account")
        }
    }

    return (
        <main className="register-page">
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
                        ✨ Join Modify Music
                    </div>
                    <h1>Create Account</h1>
                    <p style={{ margin: "6px 0 0", color: "#8a90a3", fontSize: "0.88rem" }}>
                        Experience AI-powered mood music streaming
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
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        label="Username"
                        placeholder="Choose a username"
                        required
                    />
                    <FormGroup
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        required
                    />
                    <FormGroup
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Password"
                        type="password"
                        placeholder="Create a password (min 6 chars)"
                        required
                    />

                    <button type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Creating Account..." : "Register"}
                    </button>
                </form>

                <p>
                    Already have an account? <Link to="/login">Login Here</Link>
                </p>
            </div>
        </main>
    )
}

export default Register
