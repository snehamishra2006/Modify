import api from "../../auth/services/auth.api"

export async function getSong({ mood } = {}) {
    const params = {}
    if (mood) params.mood = mood
    const response = await api.get("/api/songs", { params })
    return response.data
}

export async function getAllSongs({ mood, search } = {}) {
    const params = {}
    if (mood && mood !== 'all') params.mood = mood
    if (search && search.trim()) params.search = search.trim()
    const response = await api.get("/api/songs/all", { params })
    return response.data
}

export async function getMySongs() {
    const response = await api.get("/api/songs/my-songs")
    return response.data
}

export async function uploadSong(formData, onProgress) {
    const response = await api.post("/api/songs", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(percent)
            }
        }
    })
    return response.data
}

export async function deleteSong(id) {
    const response = await api.delete(`/api/songs/${id}`)
    return response.data
}