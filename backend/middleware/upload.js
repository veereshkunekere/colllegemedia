// middlewares/upload.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },

    filename(req, file, cb) {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        const ext = path.extname(file.originalname).toLowerCase();

        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const imageFilter = (req, file, cb) => {
    const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (allowed.includes(file.mimetype)) {
        return cb(null, true);
    }

    return cb(new Error("Invalid image type"), false);
};

const fileFilter = (req, file, cb) => {
    const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",

        "application/pdf",

        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",

        "text/plain",
        "application/zip"
    ];

    if (allowed.includes(file.mimetype)) {
        return cb(null, true);
    }

    return cb(
        new Error("Unsupported file type for upload"),
        false
    );
};

const uploadTweetImage = multer({
    storage,
    limits: {
        fileSize: 1 * 1024 * 1024,
        files: 4
    },
    fileFilter: imageFilter
}).array("images", 1);

const uploadFile = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1
    },
    fileFilter
}).single("file");

module.exports = {
    uploadTweetImage,
    uploadFile
};