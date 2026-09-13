import React from "react"
import { useAuth } from "../hooks/useAuth"
import { Navigate } from "react-router-dom"

const Protected = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div style={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#0d0f15",
                color: "#e2e8f0",
                gap: "16px"
            }}>
                <div style={{
                    width: "48px",
                    height: "48px",
                    border: "3px solid rgba(245, 158, 11, 0.2)",
                    borderTop: "3px solid #f59e0b",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }} />
                <p style={{ fontSize: "0.95rem", color: "#94a3b8", letterSpacing: "0.05em" }}>
                    Loading Modify...
                </p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default Protected
