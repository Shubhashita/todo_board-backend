const jwt = require("../utilities/jwt.utility");

const authorization = async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token missing" });
    }

    const token = header.split(" ")[1];
    const decoded = await jwt.verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }

    // normalize user id on req.user so controllers can use `req.user.id`
    const userId = decoded.id || decoded.userId || decoded._id;
    req.user = Object.assign({}, decoded, { id: userId });
    next();
};

module.exports = { authorization };

