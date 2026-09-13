const songModel = require("../models/song.model")
const storageService = require("../services/storage.service")
const id3 = require("node-id3")

async function uploadSong(req, res) {
    try {
        // Extract audio file from possible field names
        let audioFile = null;
        let posterFile = null;

        if (req.file) {
            audioFile = req.file;
        } else if (req.files) {
            audioFile = req.files['audio']?.[0] || req.files['song']?.[0];
            posterFile = req.files['poster']?.[0] || req.files['image']?.[0];
        }

        if (!audioFile) {
            return res.status(400).json({
                message: "Audio file is required (field: 'audio' or 'song')"
            });
        }

        const songBuffer = audioFile.buffer;
        const rawFilename = audioFile.originalname || "song.mp3";

        // Read ID3 tags safely
        let tags = {};
        try {
            const parsed = id3.read(songBuffer);
            if (parsed && typeof parsed === 'object') {
                tags = parsed;
            }
        } catch (id3Err) {
            console.warn("ID3 read warning:", id3Err.message);
        }

        // Determine title, artist, mood
        const fallbackTitle = rawFilename.replace(/\.[^/.]+$/, "");
        const title = (req.body.title || tags.title || fallbackTitle).trim();
        const artist = (req.body.artist || tags.artist || "Unknown Artist").trim();
        const rawMood = (req.body.mood || "neutral").toLowerCase().trim();

        const validMoods = ["happy", "sad", "surprised", "angry", "neutral", "calm", "energetic", "romantic"];
        const mood = validMoods.includes(rawMood) ? rawMood : "neutral";

        // Upload audio file to storage
        const uploadedSong = await storageService.uploadFile({
            buffer: songBuffer,
            filename: `${title}_${Date.now()}.mp3`,
            folder: "/modify/songs"
        });

        // Determine poster image
        let posterUrl = "";

        if (posterFile && posterFile.buffer) {
            // User uploaded a custom poster file
            const uploadedPoster = await storageService.uploadFile({
                buffer: posterFile.buffer,
                filename: `${title}_cover_${Date.now()}.${posterFile.originalname.split('.').pop() || 'jpeg'}`,
                folder: "/modify/posters"
            });
            posterUrl = uploadedPoster.url;
        } else if (tags.image && tags.image.imageBuffer) {
            // Embedded ID3 album art
            try {
                const uploadedPoster = await storageService.uploadFile({
                    buffer: tags.image.imageBuffer,
                    filename: `${title}_cover_${Date.now()}.jpeg`,
                    folder: "/modify/posters"
                });
                posterUrl = uploadedPoster.url;
            } catch (err) {
                console.warn("Failed to upload ID3 poster, falling back:", err.message);
                posterUrl = storageService.getDefaultPoster(mood);
            }
        } else if (req.body.posterUrl || req.body.postUrl) {
            // Passed poster URL
            posterUrl = req.body.posterUrl || req.body.postUrl;
        } else {
            // Default mood poster
            posterUrl = storageService.getDefaultPoster(mood);
        }

        // Create song in database
        const song = await songModel.create({
            title,
            artist,
            url: uploadedSong.url,
            postUrl: posterUrl,
            posterUrl: posterUrl,
            mood,
            uploadedBy: req.user?.id || null
        });

        return res.status(201).json({
            message: "Song uploaded successfully",
            song
        });
    } catch (err) {
        console.error("Song upload error:", err);
        return res.status(500).json({
            message: err.message || "Failed to upload song"
        });
    }
}

async function getSong(req, res) {
    try {
        const { mood } = req.query;
        let song = null;

        if (mood) {
            const cleanMood = mood.toLowerCase().trim();
            const songs = await songModel.aggregate([
                {
                    $match: {
                        mood: cleanMood
                    }
                },
                {
                    $sample: {
                        size: 1
                    }
                }
            ]);

            if (songs && songs.length > 0) {
                song = songs[0];
            }
        }

        // Fallback: if no song found for mood or mood not specified, get any random song
        if (!song) {
            const randomSongs = await songModel.aggregate([
                {
                    $sample: {
                        size: 1
                    }
                }
            ]);
            song = randomSongs[0] || null;
        }

        return res.status(200).json({
            message: song ? "Song fetched successfully" : "No songs available in the database",
            song
        });
    } catch (err) {
        console.error("Get song error:", err);
        return res.status(500).json({
            message: err.message || "Failed to fetch song"
        });
    }
}

async function getAllSongs(req, res) {
    try {
        const { mood, search } = req.query;
        let query = {};

        if (mood && mood !== 'all') {
            query.mood = mood.toLowerCase().trim();
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { title: regex },
                { artist: regex }
            ];
        }

        const songs = await songModel.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Songs fetched successfully",
            count: songs.length,
            songs
        });
    } catch (err) {
        console.error("Get all songs error:", err);
        return res.status(500).json({
            message: "Failed to fetch songs list"
        });
    }
}

async function getMySongs(req, res) {
    try {
        const songs = await songModel.find({
            uploadedBy: req.user.id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "My songs fetched successfully",
            count: songs.length,
            songs
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to fetch user songs"
        });
    }
}

async function deleteSong(req, res) {
    try {
        const { id } = req.params;
        const song = await songModel.findById(id);

        if (!song) {
            return res.status(404).json({
                message: "Song not found"
            });
        }

        // Allow deletion if uploaded by user or if no uploader is assigned
        if (song.uploadedBy && song.uploadedBy.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to delete this song"
            });
        }

        await songModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Song deleted successfully",
            id
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to delete song"
        });
    }
}

module.exports = {
    uploadSong,
    getSong,
    getAllSongs,
    getMySongs,
    deleteSong
}
