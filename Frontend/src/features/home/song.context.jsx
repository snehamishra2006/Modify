import { createContext, useState, useEffect, useCallback } from "react"
import { getSong, getAllSongs, getMySongs, uploadSong, deleteSong } from "./service/song.api"

export const SongContext = createContext(null)

const DEFAULT_INITIAL_SONG = {
    _id: "default_seed_track",
    title: "Sunny Days Ahead",
    artist: "Acoustic Joy",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=uplifting-day-111075.mp3",
    postUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    mood: "happy"
}

export const SongContextProvider = ({ children }) => {
    const [song, setSong] = useState(DEFAULT_INITIAL_SONG)
    const [isPlaying, setIsPlaying] = useState(false)
    const [loading, setLoading] = useState(false)
    const [currentMood, setCurrentMood] = useState("happy")
    const [library, setLibrary] = useState([])
    const [mySongs, setMySongs] = useState([])
    const [playlist, setPlaylist] = useState([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false)
    const [toast, setToast] = useState(null)

    const showToast = useCallback((message, type = "info") => {
        setToast({ message, type })
        setTimeout(() => {
            setToast(null)
        }, 4000)
    }, [])

    // Load initial songs and library
    const handleFetchAllSongs = useCallback(async ({ mood, search } = {}) => {
        try {
            const data = await getAllSongs({ mood, search })
            if (data?.songs) {
                setLibrary(data.songs)
                if (playlist.length === 0) {
                    setPlaylist(data.songs)
                }
            }
            return data?.songs || []
        } catch (err) {
            console.warn("Failed to fetch library:", err)
            return []
        }
    }, [playlist.length])

    // Load my uploaded songs
    const handleFetchMySongs = useCallback(async () => {
        try {
            const data = await getMySongs()
            if (data?.songs) {
                setMySongs(data.songs)
            }
            return data?.songs || []
        } catch (err) {
            console.warn("Failed to fetch user songs:", err)
            return []
        }
    }, [])

    // Initial load of songs
    useEffect(() => {
        handleFetchAllSongs()
    }, [handleFetchAllSongs])

    // Fetch and play song matching mood
    const handleGetSong = async ({ mood, autoPlay = true } = {}) => {
        if (!mood) return
        const cleanMood = mood.toLowerCase().trim()
        setLoading(true)
        setCurrentMood(cleanMood)
        try {
            const data = await getSong({ mood: cleanMood })
            if (data?.song) {
                setSong(data.song)
                if (autoPlay) {
                    setIsPlaying(true)
                }
                showToast(`Playing ${cleanMood.toUpperCase()} vibe: ${data.song.title}`, "success")
            } else {
                showToast(`No tracks found for "${cleanMood}", playing random track`, "info")
            }
        } catch (err) {
            console.error("Failed to get mood song:", err)
            showToast("Failed to fetch mood track", "error")
        } finally {
            setLoading(false)
        }
    }

    // Select and play a specific song
    const handleSelectSong = (selectedSong, autoPlay = true) => {
        if (!selectedSong) return
        setSong(selectedSong)
        if (selectedSong.mood) {
            setCurrentMood(selectedSong.mood)
        }
        if (autoPlay) {
            setIsPlaying(true)
        }
        showToast(`Playing: ${selectedSong.title}`, "info")
    }

    // Upload song handler
    const handleUploadSong = async (formData, onProgress) => {
        setLoading(true)
        try {
            const data = await uploadSong(formData, onProgress)
            if (data?.song) {
                showToast(`"${data.song.title}" uploaded successfully!`, "success")
                // Refresh library and my songs
                await handleFetchAllSongs()
                await handleFetchMySongs()
                // Play the newly uploaded song right away
                setSong(data.song)
                if (data.song.mood) {
                    setCurrentMood(data.song.mood)
                }
                setIsPlaying(true)
                setIsAddModalOpen(false)
                return data.song
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Failed to upload song"
            showToast(msg, "error")
            throw new Error(msg)
        } finally {
            setLoading(false)
        }
    }

    // Delete song handler
    const handleDeleteSong = async (id) => {
        try {
            await deleteSong(id)
            showToast("Song deleted successfully", "success")
            setLibrary((prev) => prev.filter((s) => s._id !== id))
            setMySongs((prev) => prev.filter((s) => s._id !== id))
            if (song?._id === id) {
                // If currently playing song was deleted, switch to another
                const remaining = library.filter((s) => s._id !== id)
                if (remaining.length > 0) {
                    setSong(remaining[0])
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to delete song"
            showToast(msg, "error")
        }
    }

    // Playlist navigation
    const playNext = () => {
        const pool = library.length > 0 ? library : playlist
        if (pool.length === 0) return
        const currentIndex = pool.findIndex((s) => s._id === song?._id)
        const nextIndex = (currentIndex + 1) % pool.length
        setSong(pool[nextIndex])
        if (pool[nextIndex].mood) setCurrentMood(pool[nextIndex].mood)
        setIsPlaying(true)
    }

    const playPrevious = () => {
        const pool = library.length > 0 ? library : playlist
        if (pool.length === 0) return
        const currentIndex = pool.findIndex((s) => s._id === song?._id)
        const prevIndex = (currentIndex - 1 + pool.length) % pool.length
        setSong(pool[prevIndex])
        if (pool[prevIndex].mood) setCurrentMood(pool[prevIndex].mood)
        setIsPlaying(true)
    }

    return (
        <SongContext.Provider
            value={{
                song,
                setSong,
                isPlaying,
                setIsPlaying,
                loading,
                setLoading,
                currentMood,
                setCurrentMood,
                library,
                mySongs,
                isAddModalOpen,
                setIsAddModalOpen,
                isLibraryModalOpen,
                setIsLibraryModalOpen,
                toast,
                showToast,
                handleGetSong,
                handleSelectSong,
                handleUploadSong,
                handleFetchAllSongs,
                handleFetchMySongs,
                handleDeleteSong,
                playNext,
                playPrevious
            }}
        >
            {children}
            {/* Global Toast Notification */}
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        top: "24px",
                        right: "24px",
                        zIndex: 9999,
                        padding: "12px 20px",
                        borderRadius: "12px",
                        background:
                            toast.type === "success"
                                ? "linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))"
                                : toast.type === "error"
                                ? "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))"
                                : "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))",
                        color: "#ffffff",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                    }}
                >
                    <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "⚠" : "ℹ"}</span>
                    <span>{toast.message}</span>
                </div>
            )}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </SongContext.Provider>
    )
}
