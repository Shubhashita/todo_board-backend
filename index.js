const dotenv = require('dotenv');
// Load default .env if it exists
dotenv.config(); 
// Load .env.local if it exists (for local overrides)
dotenv.config({ path: '.env.local', override: true });

const express = require('express');
const cors = require('cors');
const router = require('./routes/index');
const mongoDBConfig = require('./config/mongodb.config');

const app = express();

// Validate required environment variables — fail fast if missing
const REQUIRED_ENV = ['PORT', 'ENV', 'MONGO_URL', 'JWT_SECRET', 'ALLOWED_ORIGINS'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
    console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}

const PORT = process.env.PORT;
const ENV = process.env.ENV;

const allowedOrigins = process.env.ALLOWED_ORIGINS.startsWith('[')
    ? JSON.parse(process.env.ALLOWED_ORIGINS)
    : process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        if (ENV === 'development' || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`Origin ${origin} not allowed by CORS`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    maxAge: 86400 // Cache preflight response for 24 hours
};

app.use(cors(corsOptions));
app.use(express.json()); // Parses JSON request bodies

const fs = require('fs');
const path = require('path');

app.use((req, res, next) => {
    const log = `Incoming request: ${req.method} ${req.url} at ${new Date().toISOString()}\n`;
    console.log(log);
    fs.appendFileSync(path.join(__dirname, 'debug.log'), log);
    next();
});

app.get('/', (req, res) => {
    return res.json({ message: "Welcome to TODO API - Backend is running! 🚀" });
});

app.get('/health', (req, res) => {
    return res.json({ message: "Hello from TODO, server is running 🏃‍♀️" });
});

// Connect to MongoDB
mongoDBConfig();

// Static Files
app.use('/uploads', express.static('uploads'));

// app Routes
app.use('/', router);

const { ensureBucketExists } = require('./utilities/s3Bucket');

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} [${ENV}]`);
    if (ENV !== 'production') {
        ensureBucketExists();
    }

    // Keep-alive ping for production (Render free tier spins down after inactivity)
    if (ENV === 'production') {
        const BASE_URL = process.env.BASE_URL;
        if (BASE_URL) {
            const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
            setInterval(async () => {
                try {
                    const https = require('https');
                    const http = require('http');
                    const client = BASE_URL.startsWith('https') ? https : http;
                    client.get(`${BASE_URL}/health`, (res) => {
                        console.log(`[Keep-alive] Pinged /health — status: ${res.statusCode}`);
                    }).on('error', (err) => {
                        console.error('[Keep-alive] Ping failed:', err.message);
                    });
                } catch (err) {
                    console.error('[Keep-alive] Error:', err.message);
                }
            }, PING_INTERVAL_MS);
            console.log(`[Keep-alive] Self-ping enabled every 10 minutes → ${BASE_URL}/health`);
        } else {
            console.warn('[Keep-alive] BASE_URL not set — self-ping disabled');
        }
    }
});

const { exec } = require('child_process');
const mongoose = require('mongoose');

const gracefulShutdown = () => {
    console.log('\nReceived kill signal, shutting down gracefully');
    server.close(async () => {
        console.log('Closed out remaining connections');
        try {
            await mongoose.connection.close(false);
            console.log('MongoDB connection closed');
        } catch (err) {
            console.error('Error closing MongoDB connection:', err);
        }

        if (ENV === 'development') {
            console.log('Stopping MinIO Docker container...');
            exec('docker-compose stop minio', (err, stdout, stderr) => {
                if (err) {
                    console.error('Error stopping MinIO:', err);
                } else {
                    console.log('MinIO Docker container stopped');
                }
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    });

    // Force close server after 10secs
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);