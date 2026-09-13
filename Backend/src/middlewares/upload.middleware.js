const multer = require("multer")

const storage = multer.memoryStorage()

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max file size
    }
})

const uploadSongFiles = upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'song', maxCount: 1 },
    { name: 'poster', maxCount: 1 },
    { name: 'image', maxCount: 1 }
])

module.exports = {
    upload,
    uploadSongFiles
}