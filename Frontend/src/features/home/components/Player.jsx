import React, { useRef, useState, useEffect } from "react"
import { useSong } from "../hooks/useSong"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, RotateCcw, RotateCw, Gauge, ListMusic } from "lucide-react"
import "./player.scss"

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2]

const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00"
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60).toString().padStart(2, "0")
    return `${m}:${s}`
}

const Player = () => {
    const { song, isPlaying, setIsPlaying, playNext, playPrevious, setIsLibraryModalOpen } = useSong()

    const audioRef = useRef(null)
    const progressRef = useRef(null)

    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [speed, setSpeed] = useState(1)
    const [volume, setVolume] = useState(0.85)
    const [showSpeed, setShowSpeed] = useState(false)
    const [isMuted, setIsMuted] = useState(false)

    // Handle song change & autoplay
    useEffect(() => {
        if (!audioRef.current || !song?.url) return

        audioRef.current.load()
        setCurrentTime(0)

        if (isPlaying) {
            const playPromise = audioRef.current.play()
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    console.warn("Autoplay was prevented by browser policy:", err.message)
                    setIsPlaying(false)
                })
            }
        }
    }, [song?.url, song?._id])

    // Sync external isPlaying state changes
    useEffect(() => {
        if (!audioRef.current) return
        if (isPlaying) {
            audioRef.current.play().catch((err) => {
                console.warn("Audio play error:", err.message)
            })
        } else {
            audioRef.current.pause()
        }
    }, [isPlaying])

    const togglePlay = () => {
        if (!audioRef.current) return
        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true)
            }).catch((err) => {
                console.warn("Play error:", err.message)
            })
        }
    }

    const skip = (secs) => {
        if (!audioRef.current) return
        const newTime = Math.min(Math.max(audioRef.current.currentTime + secs, 0), duration || 100)
        audioRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
            audioRef.current.volume = isMuted ? 0 : volume
            audioRef.current.playbackRate = speed
        }
    }

    const handleProgressClick = (e) => {
        if (!progressRef.current || !audioRef.current || !duration) return
        const bar = progressRef.current
        const rect = bar.getBoundingClientRect()
        const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1))
        const newTime = ratio * duration
        audioRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    const handleSpeedChange = (s) => {
        setSpeed(s)
        if (audioRef.current) {
            audioRef.current.playbackRate = s
        }
        setShowSpeed(false)
    }

    const handleVolume = (e) => {
        const val = parseFloat(e.target.value)
        setVolume(val)
        if (audioRef.current) {
            audioRef.current.volume = val
        }
        setIsMuted(val === 0)
    }

    const toggleMute = () => {
        if (!audioRef.current) return
        if (isMuted) {
            audioRef.current.volume = volume || 0.5
            setIsMuted(false)
        } else {
            audioRef.current.volume = 0
            setIsMuted(true)
        }
    }

    const handleSongEnd = () => {
        // Auto play next song in library/queue
        playNext()
    }

    const progress = duration ? (currentTime / duration) * 100 : 0

    if (!song) return null

    const poster = song.posterUrl || song.postUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400"

    return (
        <div className={`player-dock mood-${song.mood || "neutral"}`}>
            <audio
                ref={audioRef}
                src={song.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleSongEnd}
            />

            <div className="player-inner">
                {/* ── 1. Song Info & Poster ── */}
                <div className="player-meta-section">
                    <div className="poster-container">
                        <img className="player-poster" src={poster} alt={song.title} />
                        {isPlaying && (
                            <div className="mini-equalizer">
                                <span className="eq-bar bar-1"></span>
                                <span className="eq-bar bar-2"></span>
                                <span className="eq-bar bar-3"></span>
                            </div>
                        )}
                    </div>
                    <div className="player-details">
                        <p className="song-title" title={song.title}>{song.title}</p>
                        <div className="song-subline">
                            <span className="song-artist">{song.artist || "Unknown Artist"}</span>
                            {song.mood && (
                                <span className={`mood-badge mood-${song.mood}`}>
                                    {song.mood}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── 2. Playback Controls & Progress Bar ── */}
                <div className="player-center-section">
                    <div className="control-buttons-row">
                        {/* Skip Backward 5s */}
                        <button className="ctrl-btn ctrl-btn--skip" onClick={() => skip(-5)} title="Rewind 5s">
                            <RotateCcw size={16} />
                            <span className="skip-tag">5s</span>
                        </button>

                        {/* Previous Track */}
                        <button className="ctrl-btn ctrl-btn--nav" onClick={playPrevious} title="Previous track">
                            <SkipBack size={18} />
                        </button>

                        {/* Big Play / Pause */}
                        <button
                            className={`ctrl-btn ctrl-btn--play ${isPlaying ? "is-playing" : ""}`}
                            onClick={togglePlay}
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause size={22} /> : <Play size={22} className="play-triangle" />}
                        </button>

                        {/* Next Track */}
                        <button className="ctrl-btn ctrl-btn--nav" onClick={playNext} title="Next track">
                            <SkipForward size={18} />
                        </button>

                        {/* Skip Forward 5s */}
                        <button className="ctrl-btn ctrl-btn--skip" onClick={() => skip(5)} title="Forward 5s">
                            <RotateCw size={16} />
                            <span className="skip-tag">5s</span>
                        </button>
                    </div>

                    {/* Progress Slider */}
                    <div className="progress-slider-wrap">
                        <span className="time-display">{formatTime(currentTime)}</span>
                        <div
                            className="progress-bar-container"
                            ref={progressRef}
                            onClick={handleProgressClick}
                        >
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                            <div className="progress-bar-thumb" style={{ left: `${progress}%` }} />
                        </div>
                        <span className="time-display">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* ── 3. Speed, Volume & Extra Tools ── */}
                <div className="player-right-section">
                    {/* Speed Selector */}
                    <div className="speed-dropdown-wrap">
                        <button
                            className="tool-btn speed-btn"
                            onClick={() => setShowSpeed(!showSpeed)}
                            title="Playback Speed"
                        >
                            <Gauge size={14} />
                            <span>{speed}×</span>
                        </button>
                        {showSpeed && (
                            <div className="speed-menu">
                                {SPEED_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        className={`speed-option ${s === speed ? "active" : ""}`}
                                        onClick={() => handleSpeedChange(s)}
                                    >
                                        {s}×
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Volume Slider */}
                    <div className="volume-control-wrap">
                        <button className="tool-btn vol-btn" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
                            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.02"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolume}
                            className="volume-slider"
                            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                        />
                    </div>

                    {/* Library drawer trigger */}
                    <button
                        className="tool-btn library-btn"
                        onClick={() => setIsLibraryModalOpen(true)}
                        title="Open Song Library"
                    >
                        <ListMusic size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Player