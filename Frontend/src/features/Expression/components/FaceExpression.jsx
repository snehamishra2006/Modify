import { useEffect, useRef, useState, useCallback } from "react"
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"
import { useSong } from "../../home/hooks/useSong"
import { Camera, CameraOff, Sparkles, RefreshCw, Zap, Volume2, Music, CheckCircle2 } from "lucide-react"
import "./face-expression.scss"

const QUICK_MOODS = [
    { key: "happy", label: "Happy", emoji: "😊", color: "#f59e0b", desc: "Upbeat & Joyful" },
    { key: "sad", label: "Sad", emoji: "😞", color: "#3b82f6", desc: "Deep & Melancholic" },
    { key: "surprised", label: "Surprised", emoji: "😮", color: "#ec4899", desc: "Cinematic & Wonder" },
    { key: "angry", label: "Angry", emoji: "😠", color: "#ef4444", desc: "High Octane & Rock" },
    { key: "neutral", label: "Neutral", emoji: "😐", color: "#14b8a6", desc: "Lo-Fi & Study Beats" },
    { key: "calm", label: "Calm", emoji: "🌿", color: "#10b981", desc: "Ambient & Relaxing" },
    { key: "energetic", label: "Energetic", emoji: "⚡", color: "#f97316", desc: "Electronic & Dance" },
    { key: "romantic", label: "Romantic", emoji: "💖", color: "#a855f7", desc: "Warm & Melodic" }
]

const FaceExpression = () => {
    const videoRef = useRef(null)
    const faceLandmarkerRef = useRef(null)
    const animationRef = useRef(null)
    const streamRef = useRef(null)

    const { handleGetSong, currentMood, song, isPlaying, setIsAddModalOpen, setIsLibraryModalOpen } = useSong()

    const [expression, setExpression] = useState("Neutral")
    const [rawMood, setRawMood] = useState("neutral")
    const [confidence, setConfidence] = useState(70)
    const [error, setError] = useState("")
    const [isStarted, setIsStarted] = useState(false)
    const [isModelLoading, setIsModelLoading] = useState(true)
    const [autoSync, setAutoSync] = useState(false)
    const [lastTriggeredMood, setLastTriggeredMood] = useState("")

    // Last mood buffer to avoid flickering
    const moodBufferRef = useRef([])

    // ==========================================
    // INITIALIZE MEDIAPIPE
    // ==========================================
    useEffect(() => {
        let mounted = true

        const initializeFaceLandmarker = async () => {
            try {
                setIsModelLoading(true)
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                )

                const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
                    },
                    runningMode: "VIDEO",
                    numFaces: 1,
                    outputFaceBlendshapes: true,
                    minFaceDetectionConfidence: 0.5,
                    minFacePresenceConfidence: 0.5,
                    minTrackingConfidence: 0.5
                })

                if (!mounted) {
                    faceLandmarker.close()
                    return
                }

                faceLandmarkerRef.current = faceLandmarker
                setIsModelLoading(false)
            } catch (err) {
                console.error("MediaPipe initialization error:", err)
                if (mounted) {
                    setIsModelLoading(false)
                    setError("AI Vision Model loading note: You can use Quick Mood buttons below.")
                }
            }
        }

        initializeFaceLandmarker()

        return () => {
            mounted = false
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop())
            }
            if (faceLandmarkerRef.current) {
                faceLandmarkerRef.current.close()
            }
        }
    }, [])

    // ==========================================
    // START CAMERA
    // ==========================================
    const handleStart = async () => {
        if (!faceLandmarkerRef.current) {
            setError("Vision AI model is still initializing. Please wait a moment...")
            return
        }

        try {
            setError("")
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user"
                },
                audio: false
            })

            streamRef.current = stream

            if (!videoRef.current) return

            videoRef.current.srcObject = stream
            videoRef.current.onloadedmetadata = async () => {
                try {
                    await videoRef.current.play()
                    setIsStarted(true)
                    detectFace()
                } catch (err) {
                    console.error("Video play error:", err)
                }
            }
        } catch (err) {
            console.error("Camera error:", err)
            setError("Camera permission denied or camera not found. You can still use the Quick Mood buttons below!")
        }
    }

    // ==========================================
    // STOP CAMERA
    // ==========================================
    const handleStop = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setIsStarted(false)
    }

    // ==========================================
    // BLENDSHAPE HELPER
    // ==========================================
    const getScore = (blendshapes, name) => {
        const shape = blendshapes.find((item) => item.categoryName === name)
        return shape ? shape.score : 0
    }

    // ==========================================
    // DETECT FACE LOOP
    // ==========================================
    const detectFace = () => {
        if (!videoRef.current || !faceLandmarkerRef.current) return

        const video = videoRef.current

        if (video.readyState >= 2) {
            try {
                const result = faceLandmarkerRef.current.detectForVideo(video, performance.now())

                if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
                    const blendshapes = result.faceBlendshapes[0].categories
                    const detected = evaluateExpression(blendshapes)

                    setExpression(detected.label)
                    setRawMood(detected.mood)
                    setConfidence(Math.round(detected.confidence * 100))

                    // Buffer smoothing for auto sync
                    moodBufferRef.current.push(detected.mood)
                    if (moodBufferRef.current.length > 15) {
                        moodBufferRef.current.shift()
                    }

                    // Check if auto-sync is active
                    if (autoSync && detected.confidence > 0.65) {
                        const mostFrequent = getMostFrequentMood(moodBufferRef.current)
                        if (mostFrequent && mostFrequent !== lastTriggeredMood && moodBufferRef.current.length >= 10) {
                            setLastTriggeredMood(mostFrequent)
                            handleGetSong({ mood: mostFrequent, autoPlay: true })
                        }
                    }
                } else {
                    setExpression("Neutral")
                    setRawMood("neutral")
                }
            } catch (err) {
                console.error("Detection error:", err)
            }
        }

        animationRef.current = requestAnimationFrame(detectFace)
    }

    const getMostFrequentMood = (arr) => {
        if (!arr.length) return null
        const counts = {}
        arr.forEach((m) => {
            counts[m] = (counts[m] || 0) + 1
        })
        let maxCount = 0
        let maxMood = null
        for (const [m, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count
                maxMood = m
            }
        }
        return maxCount >= 8 ? maxMood : null
    }

    // ==========================================
    // EXPRESSION EVALUATION
    // ==========================================
    const evaluateExpression = (blendshapes) => {
        const smileLeft = getScore(blendshapes, "mouthSmileLeft")
        const smileRight = getScore(blendshapes, "mouthSmileRight")
        const smile = (smileLeft + smileRight) / 2

        const jawOpen = getScore(blendshapes, "jawOpen")
        const browInnerUp = getScore(blendshapes, "browInnerUp")

        const browDownLeft = getScore(blendshapes, "browDownLeft")
        const browDownRight = getScore(blendshapes, "browDownRight")
        const browDown = (browDownLeft + browDownRight) / 2

        const eyeSquintLeft = getScore(blendshapes, "eyeSquintLeft")
        const eyeSquintRight = getScore(blendshapes, "eyeSquintRight")
        const eyeSquint = (eyeSquintLeft + eyeSquintRight) / 2

        const frownLeft = getScore(blendshapes, "mouthFrownLeft")
        const frownRight = getScore(blendshapes, "mouthFrownRight")
        const sadScore = (frownLeft + frownRight) / 2

        // 😮 Surprised
        if (jawOpen > 0.35 && browInnerUp > 0.2) {
            return {
                label: "Surprised 😮",
                mood: "surprised",
                confidence: Math.min((jawOpen + browInnerUp) / 2, 1)
            }
        }

        // 😊 Happy
        if (smile > 0.32) {
            return {
                label: "Happy 😊",
                mood: "happy",
                confidence: Math.min(smile * 1.3, 1)
            }
        }

        // 😠 Angry
        if (browDown > 0.35 && smile < 0.2) {
            return {
                label: "Angry 😠",
                mood: "angry",
                confidence: Math.min(browDown * 1.2, 1)
            }
        }

        // 😞 Sad
        if (sadScore > 0.02 && smile < 0.25) {
            return {
                label: "Sad 😞",
                mood: "sad",
                confidence: Math.min(sadScore * 4, 1)
            }
        }

        // 😐 Neutral
        return {
            label: "Neutral 😐",
            mood: "neutral",
            confidence: 0.75
        }
    }

    // Capture & Play current mood
    const handleCaptureAndPlay = () => {
        setLastTriggeredMood(rawMood)
        handleGetSong({ mood: rawMood, autoPlay: true })
    }

    return (
        <section className="face-expression-section">
            <div className="section-container">
                {/* Hero Header */}
                <div className="hero-header">
                    <span className="hero-tag">
                        <Sparkles size={14} /> AI Mood Detection & Music Stream
                    </span>
                    <h1 className="hero-title">
                        Listen to What You <span className="gradient-text">Feel</span>
                    </h1>
                    <p className="hero-subtitle">
                        Modify scans your facial emotion in real-time and streams songs tailored to your exact mood.
                    </p>
                </div>

                {error && (
                    <div className="camera-alert">
                        <span>{error}</span>
                    </div>
                )}

                {/* Main Camera & Detection Card */}
                <div className="detection-layout">
                    {/* Camera Viewfinder */}
                    <div className={`camera-card mood-${rawMood}`}>
                        <div className="viewfinder">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className={`camera-video ${isStarted ? "active" : ""}`}
                            />

                            {!isStarted && (
                                <div className="camera-placeholder">
                                    <div className="placeholder-icon">
                                        <Camera size={44} />
                                    </div>
                                    <p className="placeholder-title">Live Emotion Camera</p>
                                    <p className="placeholder-desc">
                                        Turn on your camera to detect expressions automatically
                                    </p>
                                    <button
                                        className="btn-start-camera"
                                        onClick={handleStart}
                                        disabled={isModelLoading}
                                    >
                                        <Camera size={18} />
                                        <span>{isModelLoading ? "Loading AI Vision..." : "Start Camera"}</span>
                                    </button>
                                </div>
                            )}

                            {isStarted && (
                                <div className="camera-live-badge">
                                    <span className="live-dot" /> LIVE VISION
                                </div>
                            )}
                        </div>

                        {/* Camera Controls & Status */}
                        {isStarted && (
                            <div className="camera-footer">
                                <div className="detected-expression-bar">
                                    <div className="expression-meta">
                                        <span className="detected-label">Detected Emotion</span>
                                        <h3 className="detected-value">{expression}</h3>
                                    </div>
                                    <div className="confidence-meter">
                                        <div className="confidence-track">
                                            <div
                                                className="confidence-fill"
                                                style={{ width: `${confidence}%` }}
                                            />
                                        </div>
                                        <span className="confidence-text">{confidence}% Confidence</span>
                                    </div>
                                </div>

                                <div className="camera-actions-row">
                                    <button className="btn-capture" onClick={handleCaptureAndPlay}>
                                        <Volume2 size={18} />
                                        <span>Play For My Expression</span>
                                    </button>

                                    <div className="auto-sync-toggle">
                                        <label className="switch-label">
                                            <input
                                                type="checkbox"
                                                checked={autoSync}
                                                onChange={(e) => setAutoSync(e.target.checked)}
                                            />
                                            <span className="slider round"></span>
                                            <span className="toggle-text">Auto-Sync Music</span>
                                        </label>
                                    </div>

                                    <button className="btn-stop-camera" onClick={handleStop} title="Turn off camera">
                                        <CameraOff size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Side Mood Selector & Information */}
                    <div className="mood-selection-panel">
                        <div className="panel-header">
                            <h3>Choose or Explore Vibes</h3>
                            <p>Select any mood vibe below to instantly listen:</p>
                        </div>

                        <div className="quick-mood-grid">
                            {QUICK_MOODS.map((m) => {
                                const isCurrent = currentMood === m.key
                                return (
                                    <button
                                        key={m.key}
                                        className={`quick-mood-card ${isCurrent ? "active" : ""}`}
                                        onClick={() => handleGetSong({ mood: m.key, autoPlay: true })}
                                        style={{ "--card-accent": m.color }}
                                    >
                                        <div className="card-top">
                                            <span className="card-emoji">{m.emoji}</span>
                                            {isCurrent && (
                                                <span className="playing-indicator">
                                                    <Volume2 size={14} /> Playing
                                                </span>
                                            )}
                                        </div>
                                        <div className="card-text">
                                            <strong className="card-label">{m.label}</strong>
                                            <span className="card-desc">{m.desc}</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FaceExpression
