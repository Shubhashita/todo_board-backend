const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Only allow jpeg/jpg
    const filetypes = /jpeg|jpg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Error: JPEG Images Only!"));
    }
};

const fileSizeValidation = { fileSize: 1024 * 1024 * 1 }; // 1MB limit


const upload = multer({
    storage: storage,
    limits: fileSizeValidation,
    fileFilter: fileFilter
});

const uploadV1 = multer({
    storage: memoryStorage,
    limits: fileSizeValidation,
    // fileFilter: fileFilter
});

const handleUpload = (multerInstance) => {
    return (req, res, next) => {
        multerInstance(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.status(400).json({ message: err.message });
            } else if (err) {
                // An unknown error occurred when uploading.
                return res.status(400).json({ message: err.message });
            }
            next();
            // Everything went fine.
        });
    };
};

module.exports = { upload, uploadV1, handleUpload };
