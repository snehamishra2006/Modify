 const multer = require("multer")

 const storage = multer.memoryStorage()

 const upload = multer({
    storage:storage,
    Limits:{
        fileSize: 1024*1024*10 //10MB
    }
 })


 module.exports= upload