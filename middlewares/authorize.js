const jwt = require("../utilities/jwt.utility");
const UserModel = require("../models/users.model");

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

    const userId = decoded.id || decoded.userId || decoded._id;
    let role = decoded.role;
    if (!role) {
        try {
            const user = await UserModel.findById(userId);
            if (user) {
                role = user.role;
            }
        } catch (err) {
            console.error("Error fetching user role:", err);
        }
    }

    //
    req.user = Object.assign({}, decoded, { id: userId, role });
    next();
};

module.exports = { authorization };
