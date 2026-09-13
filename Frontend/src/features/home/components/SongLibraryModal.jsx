import React, { useState, useEffect } from "react"
import { useSong } from "../hooks/useSong"
import { useAuth } from "../../auth/hooks/useAuth"
import { X, Search, Play, Pause, Trash2, Plus, Music, Sparkles } from "lucide-react"
import "./song-library.scss"

const TABS = [
    { key: "all", label: "All Songs", emoji: "🎵" },
    { key: "happy", label: "Happy", emoji: "😊" },
    { key: "sad", label: "Sad", emoji: "😞" },
    { key: "surprised", label: "Surprised", emoji: "😮" },
    { key: "angry", label: "Angry", emoji: "😠" },
    { key: "neutral", label: "Neutral", emoji: "😐" },
    { key: "calm", label: "Calm", emoji: "🌿" },
    { key: "energetic", label: "Energetic", emoji: "⚡" },
    { key: "my_uploads", label: "My Uploads", emoji: "⭐" }
]

const SongLibraryModal = () => {
    const {
        isLibraryModalOpen,
        setIsLibraryModalOpen,
        setIsAddModalOpen,
        library,
        mySongs,
        song: currentSong,
        isPlaying,
        handleSelectSong,
        handleDeleteSong,
        handleFetchAllSongs,
        handleFetchMySongs
    } = useSong()

    const { user } = useAuth()

    const [activeTab, setActiveTab] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (isLibraryModalOpen) {
            handleFetchAllSongs()
            handleFetchMySongs()
        }
    }, [isLibraryModalOpen, handleFetchAllSongs, handleFetchMySongs])

    if (!isLibraryModalOpen) return null

    // Filter songs according to active tab and search keyword
    const sourceList = activeTab === "my_uploads" ? mySongs : library

    const filteredSongs = sourceList.filter((s) => {
        const matchesMood =
            activeTab === "all" || activeTab === "my_uploads" || s.mood?.toLowerCase() === activeTab

        const q = searchQuery.toLowerCase().trim()
        const matchesSearch =
            !q ||
            s.title?.toLowerCase().includes(q) ||
            s.artist?.toLowerCase().includes(q)

        return matchesMood && matchesSearch
    })

    const closeModal = () => {
        setIsLibraryModalOpen(false)
    }

    return (
        <div className="modal-backdrop" onClick={closeModal}>
            <div className="library-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="library-header">
                    <div className="library-title-wrap">
                        <div className="icon-badge">
                            <Music size={20} />
                        </div>
                        <div>
                            <h2>Song Library</h2>
                            <p>Explore all available tracks or browse your custom uploads</p>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button
                            className="btn-add-shortcut"
                            onClick={() => {
                                setIsLibraryModalOpen(false)
                                setIsAddModalOpen(true)
                            }}
                        >
                            <Plus size={16} />
                            <span>Add Track</span>
                        </button>
                        <button className="close-btn" onClick={closeModal}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Search & Tabs */}
                <div className="library-controls">
                    {/* Search Bar */}
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title or artist..."
                        />
                        {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery("")}>
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="filter-tabs">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                <span>{tab.emoji}</span>
                                <span>{tab.label}</span>
                                {tab.key === "my_uploads" && mySongs.length > 0 && (
                                    <span className="count-badge">{mySongs.length}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Song List */}
                <div className="songs-list-container">
                    {filteredSongs.length > 0 ? (
                        <div className="songs-grid">
                            {filteredSongs.map((track) => {
                                const isCurrent = currentSong?._id === track._id
                                const isPlayingThis = isCurrent && isPlaying
                                const isOwner = track.uploadedBy === user?.id || (user && track.uploadedBy?._id === user?.id)

                                return (
                                    <div
                                        key={track._id}
                                        className={`song-card ${isCurrent ? "is-active" : ""}`}
                                        onClick={() => handleSelectSong(track, true)}
                                    >
                                        <div className="card-poster-wrap">
                                            <img
                                                src={track.posterUrl || track.postUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400"}
                                                alt={track.title}
                                                className="card-poster"
                                            />
                                            <div className="play-overlay">
                                                {isPlayingThis ? (
                                                    <div className="equalizer-bars">
                                                        <span className="eq-bar eq-1"></span>
                                                        <span className="eq-bar eq-2"></span>
                                                        <span className="eq-bar eq-3"></span>
                                                    </div>
                                                ) : (
                                                    <Play size={20} className="play-icon" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="card-info">
                                            <p className="song-title" title={track.title}>{track.title}</p>
                                            <p className="song-artist" title={track.artist}>{track.artist || "Unknown Artist"}</p>
                                            <div className="card-footer">
                                                <span className={`card-mood-pill mood-${track.mood}`}>
                                                    {track.mood}
                                                </span>
                                                {isOwner && (
                                                    <button
                                                        className="delete-song-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            if (window.confirm(`Delete "${track.title}"?`)) {
                                                                handleDeleteSong(track._id)
                                                            }
                                                        }}
                                                        title="Delete your track"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-emoji">🔍</div>
                            <h3>No songs found</h3>
                            <p>
                                {searchQuery
                                    ? `No tracks matching "${searchQuery}" in this category.`
                                    : activeTab === "my_uploads"
                                    ? "You haven't uploaded any songs yet. Be the first to share one!"
                                    : "No tracks available in this mood category."}
                            </p>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    setIsLibraryModalOpen(false)
                                    setIsAddModalOpen(true)
                                }}
                            >
                                <Plus size={16} />
                                <span>Upload a Song</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SongLibraryModal
