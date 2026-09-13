import { useContext } from "react"
import { SongContext } from "../song.context"

export const useSong = () => {
    const context = useContext(SongContext)
    if (!context) {
        throw new Error("useSong must be used within a SongContextProvider")
    }
    return context
}