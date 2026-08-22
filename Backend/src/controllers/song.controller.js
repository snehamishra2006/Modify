const songModel = require("../models/song.model")
const storageService = require("../services/storage.service")
const id3 = require("node-id3")

async function uploadSong(req, res) {

    const songBuffer = req.file.buffer

    const { mood } = req.body
    const tags = id3.read(songBuffer)

    const [songFile, posterFile] = await Promise.all([
        storageService.uploadFile({
            buffer: songBuffer,
            filename: tags.title + ".mp3",
            folder: "/modify/songs"
        }),

        storageService.uploadFile({
            buffer: tags.image.imageBuffer,
            filename: tags.title + ".jpeg",
            folder: "/modify/posters"
        })
    ])

    const song = await songModel.create({
        title: tags.title,
        url: songFile.url,
        postUrl: posterFile.url,
        mood
    })

    res.status(201).json({
        message: "song created successfully",
        song
    })
}


// async function getSong(req,res){
//     const{mood} = req.query
//     const song = await songModel.findOne({
//         mood
//     })
//     res.status(200).json({
//         message:"song fetched successfully",
//         song
//     })
// }

async function getSong(req, res) {
    const { mood } = req.query

    const songs = await songModel.aggregate([
        {
            $match: {
                mood: mood
            }
        },
        {
            $sample: {
                size: 1
            }
        }
    ])

    const song = songs[0] || null

    res.status(200).json({
        message: "song fetched successfully",
        song
    })
}

module.exports = {
    uploadSong,
    getSong
}
