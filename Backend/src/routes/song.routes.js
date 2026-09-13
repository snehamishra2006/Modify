const express = require("express")
const { uploadSongFiles } = require("../middlewares/upload.middleware")
const songController = require("../controllers/song.controller")
const { authUser, optionalAuth } = require("../middlewares/auth.middleware")

const router = express.Router()

// POST /api/songs - upload song (authenticated or with optional user identification)
router.post("/", optionalAuth, uploadSongFiles, songController.uploadSong)

// GET /api/songs - get random/recommended song by mood
router.get("/", songController.getSong)

// GET /api/songs/all - explore full song library with mood & search filters
router.get("/all", songController.getAllSongs)

// GET /api/songs/my-songs - get songs uploaded by logged-in user
router.get("/my-songs", authUser, songController.getMySongs)

// DELETE /api/songs/:id - delete a song
router.delete("/:id", authUser, songController.deleteSong)

module.exports = router