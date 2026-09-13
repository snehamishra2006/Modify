const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const path = require("path")
const app = express()

app.use(express.json())
app.use(cookieParser())

// Allow any localhost / local dev frontend origin with credentials
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
            callback(null, true)
        } else {
            callback(null, false) // Reject other origins
        }
    },
    credentials: true
}))

// Routes
const authRoutes = require("./routes/auth.routes")
const songRoutes = require("./routes/song.routes")

app.use("/api/auth", authRoutes)
app.use("/api/songs", songRoutes)

// Serve frontend static files
app.use(express.static(path.join(__dirname, "..", "public")))

// SPA fallback — catch anything not matched above
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"))
})

module.exports = app