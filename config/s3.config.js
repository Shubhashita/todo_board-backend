const { S3Client } = require('@aws-sdk/client-s3');

const isProduction = process.env.ENV === 'production';

const s3Config = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.MINIO_ROOT_USER || process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD || process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin'
    },
    forcePathStyle: true // Needed for MinIO, typically okay for S3 too
};

// Only force a custom endpoint if provided or if we are local
if (process.env.MINIO_ENDPOINT) {
    s3Config.endpoint = process.env.MINIO_ENDPOINT;
} else if (!isProduction) {
    // Default to local MinIO in development
    s3Config.endpoint = 'http://127.0.0.1:9000';
}

const s3 = new S3Client(s3Config);

module.exports = s3;
