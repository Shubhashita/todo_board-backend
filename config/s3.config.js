const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: 'us-east-1', // Region is required in v3, use dummy for MinIO
    credentials: {
        accessKeyId: process.env.MINIO_ROOT_USER || 'minioadmin',
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin'
    },
    endpoint: process.env.MINIO_ENDPOINT || 'http://127.0.0.1:9000',
    forcePathStyle: true // Needed for MinIO ("s3ForcePathStyle" in v2)
});

module.exports = s3;
