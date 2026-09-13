import React, { useState } from "react"
import { useAuth } from "../../auth/hooks/useAuth"
import { useSong } from "../../home/hooks/useSong"
import { Music, PlusCircle, LogOut, User, Sparkles, Compass } from "lucide-react"
import "./navbar.scss"

const MOOD_EMOJIS = {
    happy: "😊",
    sad: "😞",
    surprised: "😮",
    angry: "😠",
    neutral: "😐",
    calm: "🌿",
    energetic: "⚡",
    romantic: "💖"
}

const Navbar = () => {
    const { user, handleLogout } = useAuth()
    const { currentMood, setIsAddModalOpen, setIsLibraryModalOpen } = useSong()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const moodEmoji = MOOD_EMOJIS[currentMood] || "🎵"

    return (
        <header className="navbar-container">
            <div className="navbar-inner">
                {/* Brand / Logo */}
                <div className="navbar-brand">
                    <div className="brand-icon">
                        <div className="bar bar-1"></div>
                        <div className="bar bar-2"></div>
                        <div className="bar bar-3"></div>
                        <div className="bar bar-4"></div>
                    </div>
                    <div className="brand-text">
                        <span className="brand-name">Modify</span>
                        <span className="brand-badge">AI Mood Music</span>
                    </div>
                </div>

                {/* Active Mood Pill */}
                <div className={`active-mood-pill mood-${currentMood}`}>
                    <span className="mood-emoji">{moodEmoji}</span>
                    <span className="mood-text">
                        <span className="mood-label">Current Vibe:</span>{" "}
                        <strong className="mood-name">{currentMood}</strong>
                    </span>
                    <span className="pulse-dot"></span>
                </div>

                {/* Actions */}
                <div className="navbar-actions">
                    <button
                        className="nav-btn nav-btn--library"
                        onClick={() => setIsLibraryModalOpen(true)}
                        title="Explore Songs Library"
                    >
                        <Compass size={18} />
                        <span>Song Library</span>
                    </button>

                    <button
                        className="nav-btn nav-btn--add"
                        onClick={() => setIsAddModalOpen(true)}
                        title="Upload a new song"
                    >
                        <PlusCircle size={18} />
                        <span>Add Song</span>
                    </button>

                    {/* User Profile / Logout */}
                    <div className="user-profile-menu">
                        <button
                            className="user-btn"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            title="Account Settings"
                        >
                            <div className="user-avatar">
                                {user?.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <span className="user-name">{user?.username || "User"}</span>
                        </button>

                        {isMenuOpen && (
                            <div className="user-dropdown">
                                <div className="dropdown-header">
                                    <p className="dropdown-user-name">{user?.username}</p>
                                    <p className="dropdown-user-email">{user?.email}</p>
                                </div>
                                <div className="dropdown-divider" />
                                <button
                                    className="dropdown-item dropdown-logout"
                                    onClick={() => {
                                        setIsMenuOpen(false)
                                        handleLogout()
                                    }}
                                >
                                    <LogOut size={16} />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar
