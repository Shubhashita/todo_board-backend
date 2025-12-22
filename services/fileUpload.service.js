const s3 = require("../config/s3.config");
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const path = require("path");

const fileUploadService = {};

fileUploadService.uploadFileToMinIO = async (file) => {
    try {
        const bucketName = process.env.MINIO_BUCKET || 'uploads';
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        const filename = `${timestamp}${extension}`;

        const params = {
            Bucket: bucketName,
            Key: filename,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read' // Optional, depending on bucket policy
        };

        // Upload to S3 (MinIO)
        await s3.send(new PutObjectCommand(params));

        // Generate presigned URL
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: filename
        });
        const url = await getSignedUrl(s3, command, { expiresIn: 24 * 60 * 60 }); // 1 day

        return {
            filename: filename,
            url: url
        };
    } catch (error) {
        console.error("Error in uploadFileToMinIO:", error);
        throw error;
    }
};

fileUploadService.deleteFileFromMinIO = async (filename) => {
    try {
        const bucketName = process.env.MINIO_BUCKET || 'uploads';
        const params = {
            Bucket: bucketName,
            Key: filename
        };

        await s3.send(new DeleteObjectCommand(params));
        return true;
    } catch (error) {
        console.error("Error in deleteFileFromMinIO:", error);
        throw error;
    }
};

module.exports = fileUploadService;
