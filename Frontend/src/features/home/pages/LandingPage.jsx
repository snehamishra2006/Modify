import React from "react"
import Navbar from "../../shared/components/Navbar"
import FaceExpression from "../../Expression/components/FaceExpression"
import Player from "../components/Player"
import AddSongModal from "../components/AddSongModal"
import SongLibraryModal from "../components/SongLibraryModal"

const LandingPage = () => {
    return (
        <div className="modify-app-layout">
            <Navbar />
            <main className="modify-main-content">
                <FaceExpression />
            </main>
            <AddSongModal />
            <SongLibraryModal />
            <Player />
        </div>
    )
}

export default LandingPage