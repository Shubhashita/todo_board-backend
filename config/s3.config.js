const { S3Client } = require('@aws-sdk/client-s3');

const s3Config = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.MINIO_ROOT_USER || process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD || process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin'
    },
    endpoint: process.env.MINIO_ENDPOINT || 'http://127.0.0.1:9000',
    forcePathStyle: true,
};


const s3 = new S3Client(s3Config);

module.exports = s3;
