const multer = require("multer")
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")
const cloudinary = require("cloudinary").v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

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
            const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            
            // Resize all images to max 800x800 and convert to WebP (preserves transparency for PNGs)
            const finalBuffer = await sharp(req.file.buffer)
                .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();
                
            const format = 'webp';
            
            // Upload to Cloudinary using upload_stream
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "kambuja-pos/products",
                        public_id: uniquePrefix,
                        format: format
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(finalBuffer);
            });
            
            return res.status(200).json({
                success:true,
                message: "Image upload successfully!",
                filename: result.secure_url
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

exports.removeFile = async (req, res) => {
    try {
        if(!req.params.imageUrl){
            return res.status(400).json({
                success: false,
                error: "Image is required!"
            })
        }
        
        const imageUrl = req.params.imageUrl;
        
        // If it's a cloudinary URL, try to extract the public ID to delete it
        if (imageUrl.includes('cloudinary.com')) {
            // e.g. https://res.cloudinary.com/drdyvvajp/image/upload/v1234567/kambuja-pos/products/123123.webp
            // We need to extract: kambuja-pos/products/123123
            const parts = imageUrl.split('/');
            const filename = parts.pop().split('.')[0]; // 123123
            const folder2 = parts.pop(); // products
            const folder1 = parts.pop(); // kambuja-pos
            const publicId = `${folder1}/${folder2}/${filename}`;
            
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.error("Cloudinary delete error:", err);
            }
        }
        
        res.status(200).json({
            success: true,
            message: "Image deleted successfully!"
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Error while deleting image!"
        })   
    } 
}
