const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

// Generate JWT
const generateToken = (payload) => {
    // Ensure role (and other fields) is included in the token payload if passed
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
};

// Verify JWT
const verifyToken = async (token) => {
    try {
        const verified = await jwt.verify(token, SECRET);
        return verified;
    } catch (err) {
        return null; // so middlewarse can handle errors gracefully
    }
};

// Decode token (without verifying)
const decodeToken = (token) => {
    return jwt.decode(token);
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
};