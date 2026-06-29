const multer = require("multer")
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const uploadDir = path.resolve(__dirname, "../upload")

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

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true)
    } else {
        cb(new Error("Only image files are allowed"), false)
    }
}

const upload = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
})

exports.uploadFile = (req, res) => {
    upload.single("imageUrl")(req, res, async (err) => {
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
        
        try {
            fs.mkdirSync(uploadDir, {recursive: true});
            const extName = path.extname(req.file.originalname).toLowerCase();
            const isPng = extName === '.png' && req.file.mimetype === 'image/png';
            
            const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            let finalBuffer;
            let finalFilename;
            
            // Resize all images to max 800x800
            const imageProcessor = sharp(req.file.buffer)
                .resize(800, 800, { fit: 'inside', withoutEnlargement: true });
                
            if (isPng) {
                // For logo/icon: PNG keep original format
                finalBuffer = await imageProcessor.png().toBuffer();
                finalFilename = `${uniquePrefix}.png`;
            } else {
                // For product photo: WebP quality 80
                finalBuffer = await imageProcessor.webp({ quality: 80 }).toBuffer();
                finalFilename = `${uniquePrefix}.webp`;
            }
            
            const outputPath = path.resolve(uploadDir, finalFilename);
            fs.writeFileSync(outputPath, finalBuffer);
            
            return res.status(200).json({
                success:true,
                message: "Image upload successfully!",
                filename: finalFilename
            });
            
        } catch (error) {
            console.error("Image processing error:", error);
            return res.status(500).json({
                success:false,
                error:"Error processing image"
            });
        }
    })
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
