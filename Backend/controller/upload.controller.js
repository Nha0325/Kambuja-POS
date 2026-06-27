const multer = require("multer")
const fs = require("fs")
const path = require("path")

const uploadDir = path.resolve(__dirname, "../upload")
const allowedImageTypes = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
}

const getSafeUploadPath = (filename) => {
    if (!filename || filename !== path.basename(filename)) {
        throw new Error("Invalid file path")
    }

    const filePath = path.resolve(uploadDir, filename)
    const relativePath = path.relative(uploadDir, filePath)
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        throw new Error("Invalid file path")
    }

    return filePath
}

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(uploadDir, {recursive: true})
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const extName = path.extname(file.originalname).toLowerCase()
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extName}`
        cb(null, filename)
    }

})

const fileFilter = (req, file, cb) => {
    const extName = path.extname(file.originalname).toLowerCase()
    const allowedExtensions = allowedImageTypes[file.mimetype]

    if(allowedExtensions?.includes(extName)){
        cb(null, true)
    }
    else{
        cb( new Error("Only JPEG, PNG, and WebP images are allowed"), false)
    }
}

const upload = multer({
    storage: diskStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
})

exports.uploadFile = (req, res) => {
    try {
        
        upload.single("imageUrl")(req, res, (err) => {
            if(err){
                return res.status(400).json({
                    success:false,
                    error: err.message
                })
            }
            if(!req.file){
                return res.status(400).json({
                    success:false,
                    error: "No file provided!"
                })
            }
            return res.status(200).json({
                    success:true,
                    message: "Image upload successfully!",
                    filename: req.file.filename
            })
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            error:"Upload failed"
        })
    }
}
exports.removeFile = (req, res) => {
    try {
        if(!req.params.imageUrl){
            return res.status(400).json({
                success: false,
                error: "Image is required!"
            })
        }
        const imagePath = getSafeUploadPath(req.params.imageUrl)

        if(fs.existsSync(imagePath)){
            fs.unlinkSync(imagePath)
            res.status(200).json({
                success: true,
                message: "Image deleted successfully!"
            })
        }
        else{
            res.status(200).json({
                success: true,
                message: "Image already deleted or not found!"
            })     
        }
    } catch (error) {
        if (error.message === "Invalid file path") {
            return res.status(400).json({
                success: false,
                error: "Invalid file path"
            })
        }
        res.status(500).json({
            success: false,
            error: "Error while deleting image!"
        })   
    } 
}
