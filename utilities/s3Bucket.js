const s3 = require('../config/s3.config');
const { HeadBucketCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');

const ensureBucketExists = async () => {
    const bucketName = process.env.MINIO_BUCKET || 'uploads';

    try {
        await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
        console.log(`✅ S3 Bucket '${bucketName}' exists.`);
    } catch (error) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            try {
                await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
                console.log(`✅ S3 Bucket '${bucketName}' created successfully.`);
            } catch (createError) {
                console.error(`❌ Failed to create S3 bucket '${bucketName}': `, createError);
            }
        } else {
            console.error(`❌ Error checking S3 bucket '${bucketName}': `, error);
        }
    }
};

module.exports = { ensureBucketExists };
