import React, { useState, useRef } from "react"
import { useSong } from "../hooks/useSong"
import { X, UploadCloud, Music, Image, Sparkles, Check, Play, Pause, AlertCircle } from "lucide-react"
import "./add-song.scss"

const MOODS = [
    { key: "happy", label: "Happy", emoji: "😊", color: "#f59e0b" },
    { key: "sad", label: "Sad", emoji: "😞", color: "#3b82f6" },
    { key: "surprised", label: "Surprised", emoji: "😮", color: "#ec4899" },
    { key: "angry", label: "Angry", emoji: "😠", color: "#ef4444" },
    { key: "neutral", label: "Neutral", emoji: "😐", color: "#14b8a6" },
    { key: "calm", label: "Calm", emoji: "🌿", color: "#10b981" },
    { key: "energetic", label: "Energetic", emoji: "⚡", color: "#f97316" },
    { key: "romantic", label: "Romantic", emoji: "💖", color: "#a855f7" }
]

const AddSongModal = () => {
    const { isAddModalOpen, setIsAddModalOpen, handleUploadSong } = useSong()

    const [audioFile, setAudioFile] = useState(null)
    const [posterFile, setPosterFile] = useState(null)
    const [posterPreview, setPosterPreview] = useState("")
    const [title, setTitle] = useState("")
    const [artist, setArtist] = useState("")
    const [mood, setMood] = useState("happy")
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState("")

    // Audio preview
    const [audioPreviewUrl, setAudioPreviewUrl] = useState("")
    const [isPlayingPreview, setIsPlayingPreview] = useState(false)
    const previewAudioRef = useRef(null)

    if (!isAddModalOpen) return null

    const handleAudioChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
            setError("Please select a valid audio file (MP3, WAV, M4A, OGG).")
            return
        }

        setError("")
        setAudioFile(file)
        const url = URL.createObjectURL(file)
        setAudioPreviewUrl(url)

        // Auto fill title if empty
        if (!title) {
            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
            setTitle(cleanName)
        }
    }

    const handlePosterChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file for the cover art.")
            return
        }

        setError("")
        setPosterFile(file)
        const previewUrl = URL.createObjectURL(file)
        setPosterPreview(previewUrl)
    }

    const toggleAudioPreview = () => {
        if (!previewAudioRef.current) return
        if (isPlayingPreview) {
            previewAudioRef.current.pause()
            setIsPlayingPreview(false)
        } else {
            previewAudioRef.current.play()
            setIsPlayingPreview(true)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!audioFile) {
            setError("Please choose an audio file to upload.")
            return
        }

        if (!title.trim()) {
            setError("Please enter a song title.")
            return
        }

        const formData = new FormData()
        formData.append("audio", audioFile)
        formData.append("title", title.trim())
        formData.append("artist", (artist.trim() || "Unknown Artist"))
        formData.append("mood", mood)

        if (posterFile) {
            formData.append("poster", posterFile)
        }

        setIsUploading(true)
        setUploadProgress(0)

        try {
            await handleUploadSong(formData, (percent) => {
                setUploadProgress(percent)
            })
            // Reset modal state
            setAudioFile(null)
            setPosterFile(null)
            setPosterPreview("")
            setAudioPreviewUrl("")
            setTitle("")
            setArtist("")
            setMood("happy")
            setIsUploading(false)
        } catch (err) {
            setError(err.message || "Failed to upload song. Please try again.")
            setIsUploading(false)
        }
    }

    const closeModal = () => {
        if (isUploading) return
        if (previewAudioRef.current) {
            previewAudioRef.current.pause()
        }
        setIsAddModalOpen(false)
    }

    return (
        <div className="modal-backdrop" onClick={closeModal}>
            <div className="add-song-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <div className="modal-title-wrap">
                        <div className="icon-badge">
                            <UploadCloud size={20} />
                        </div>
                        <div>
                            <h2>Add New Song</h2>
                            <p>Upload your favorite tracks & categorize them by mood</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={closeModal} disabled={isUploading}>
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="modal-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="add-song-form">
                    {/* File Upload Section */}
                    <div className="upload-grid">
                        {/* Audio File Dropzone */}
                        <div className={`dropzone audio-dropzone ${audioFile ? "has-file" : ""}`}>
                            <input
                                type="file"
                                id="audio-input"
                                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                                onChange={handleAudioChange}
                                disabled={isUploading}
                            />
                            <label htmlFor="audio-input" className="dropzone-label">
                                <div className="dropzone-icon">
                                    <Music size={28} />
                                </div>
                                {audioFile ? (
                                    <div className="file-info">
                                        <p className="file-name">{audioFile.name}</p>
                                        <span className="file-size">
                                            {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                    </div>
                                ) : (
                                    <div className="dropzone-text">
                                        <p className="main-text">Choose Audio Track</p>
                                        <span className="sub-text">MP3, WAV, OGG, M4A up to 50MB</span>
                                    </div>
                                )}
                            </label>

                            {/* Audio Mini Previewer */}
                            {audioPreviewUrl && (
                                <div className="audio-preview-bar">
                                    <audio
                                        ref={previewAudioRef}
                                        src={audioPreviewUrl}
                                        onEnded={() => setIsPlayingPreview(false)}
                                    />
                                    <button
                                        type="button"
                                        className="preview-play-btn"
                                        onClick={toggleAudioPreview}
                                    >
                                        {isPlayingPreview ? <Pause size={14} /> : <Play size={14} />}
                                        <span>{isPlayingPreview ? "Pause Preview" : "Preview Audio"}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Cover Art Dropzone */}
                        <div className={`dropzone image-dropzone ${posterPreview ? "has-file" : ""}`}>
                            <input
                                type="file"
                                id="poster-input"
                                accept="image/*"
                                onChange={handlePosterChange}
                                disabled={isUploading}
                            />
                            <label htmlFor="poster-input" className="dropzone-label">
                                {posterPreview ? (
                                    <div className="poster-preview-wrap">
                                        <img src={posterPreview} alt="Cover preview" className="poster-img" />
                                        <div className="poster-change-overlay">
                                            <Image size={20} />
                                            <span>Change Cover</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="dropzone-icon">
                                            <Image size={28} />
                                        </div>
                                        <div className="dropzone-text">
                                            <p className="main-text">Cover Art (Optional)</p>
                                            <span className="sub-text">JPG, PNG, WEBP or auto-generated</span>
                                        </div>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Meta Fields */}
                    <div className="form-fields">
                        <div className="input-group">
                            <label>Song Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Blinding Lights"
                                required
                                disabled={isUploading}
                            />
                        </div>

                        <div className="input-group">
                            <label>Artist Name</label>
                            <input
                                type="text"
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                placeholder="e.g. The Weeknd"
                                disabled={isUploading}
                            />
                        </div>
                    </div>

                    {/* Mood Selector */}
                    <div className="mood-select-group">
                        <label>Select Song Mood Vibe *</label>
                        <div className="mood-chips">
                            {MOODS.map((m) => (
                                <button
                                    type="button"
                                    key={m.key}
                                    className={`mood-chip ${mood === m.key ? "selected" : ""}`}
                                    onClick={() => setMood(m.key)}
                                    disabled={isUploading}
                                    style={{
                                        "--chip-color": m.color
                                    }}
                                >
                                    <span className="chip-emoji">{m.emoji}</span>
                                    <span className="chip-label">{m.label}</span>
                                    {mood === m.key && <Check size={14} className="chip-check" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Upload Progress Bar */}
                    {isUploading && (
                        <div className="upload-progress-wrap">
                            <div className="progress-bar-track">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <div className="progress-labels">
                                <span>Uploading & Processing audio...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={closeModal}
                            disabled={isUploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isUploading || !audioFile}
                        >
                            <UploadCloud size={18} />
                            <span>{isUploading ? "Uploading Track..." : "Upload & Play Now"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddSongModal
