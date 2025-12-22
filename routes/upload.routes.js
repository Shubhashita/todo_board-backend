const express = require("express");
const router = express.Router();
const { uploadV1, handleUpload } = require("../middlewares/upload.middleware");
const uploadController = require("../controllers/upload.controller");

router.post("/", handleUpload(uploadV1.single("file")), uploadController.uploadFile);

module.exports = router;