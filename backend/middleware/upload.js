// middlewares/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Use diskStorage to save file with original name
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const imageFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const fileFilter = (req, file, cb) => {
    const allowed = [
        // Images
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        // PDFs
        'application/pdf',
        // Docs
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // PPT
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Text / others
        'text/plain', 'application/zip'
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type for upload'), false);
    }
};

uploadTweetImage=multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: imageFilter
}).array('images', 4); // max 4 images

const uploadFile=multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: fileFilter
}).single('file', 1); // single file
module.exports = {uploadTweetImage,uploadFile};
