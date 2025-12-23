const s3 = require("../config/s3.config");
const cloudinary = require("../config/cloudinary.config");
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const path = require("path");
const stream = require('stream');

const fileUploadService = {};

const isProduction = process.env.ENV === 'production' || process.env.NODE_ENV === 'production';

fileUploadService.uploadFile = async (file) => {
    if (isProduction) {
        return await uploadToCloudinary(file);
    } else {
        return await uploadToMinIO(file);
    }
};

fileUploadService.deleteFile = async (filename) => {
    if (isProduction) {
        return await deleteFromCloudinary(filename);
    } else {
        return await deleteFromMinIO(filename);
    }
};

// --- Cloudinary Implementation ---

const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "todo-board",
                resource_type: "auto"
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return reject(error);
                }
                resolve({
                    filename: result.public_id, // Cloudinary public_id used as filename/identifier
                    url: result.secure_url
                });
            }
        );

        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);
        bufferStream.pipe(uploadStream);
    });
};

const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        throw error;
    }
};

// --- MinIO Implementation ---

const uploadToMinIO = async (file) => {
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
        };

        await s3.send(new PutObjectCommand(params));

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
        console.error("Error in uploadToMinIO:", error);
        throw error;
    }
};

const deleteFromMinIO = async (filename) => {
    try {
        const bucketName = process.env.MINIO_BUCKET || 'uploads';
        const params = {
            Bucket: bucketName,
            Key: filename
        };

        await s3.send(new DeleteObjectCommand(params));
        return true;
    } catch (error) {
        console.error("Error in deleteFromMinIO:", error);
        throw error;
    }
};

// Backward compatibility (if needed by other files)
fileUploadService.uploadFileToMinIO = fileUploadService.uploadFile;
fileUploadService.deleteFileFromMinIO = fileUploadService.deleteFile;

module.exports = fileUploadService;
