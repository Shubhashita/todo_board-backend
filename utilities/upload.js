import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./minioClient.js";
import fs from "fs";

const uploadFile = async function () {
    try {
        const fileContent = fs.readFileSync("test.txt");

        const command = new PutObjectCommand({
            Bucket: "uploads",
            Key: "test.txt",
            Body: fileContent,
            ContentType: "text/plain",
        });

        await s3Client.send(command);
        console.log("Uploaded successfully!");
    } catch (err) {
        console.error("Upload error:", err);
    }
}

module.exports = { uploadFile };
