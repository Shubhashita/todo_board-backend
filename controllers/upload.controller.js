const fileUploadService = require("../services/fileUpload.service");

const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const result = await fileUploadService.uploadFileToMinIO();

        res.status(200).json({
            message: "File uploaded successfully",
            filename: result.filename,
            url: result.url
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "File upload failed", error: error.message });
    }
};

module.exports = {
    uploadFile
};
