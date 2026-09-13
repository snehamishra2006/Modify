const jwt = require("jsonwebtoken")
const redis = require("../config/cache")

async function authUser(req, res, next) {
    let token = req.cookies?.token;

    // Also check Authorization header (Bearer <token>)
    if (!token && req.headers.authorization) {
        if (req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } else {
            token = req.headers.authorization;
        }
    }

    if (!token) {
        return res.status(401).json({
            message: "Authentication token not provided"
        });
    }

    // Check if token is blacklisted in Redis (with safe catch)
    try {
        if (redis && redis.status === 'ready') {
            const isTokenBlacklisted = await redis.get(token);
            if (isTokenBlacklisted) {
                return res.status(401).json({
                    message: "Token has been revoked/invalidated"
                });
            }
        }
    } catch (err) {
        console.warn("Redis blacklist check warning:", err.message);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.token = token;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

// Optional Auth: if token exists, decode user, otherwise continue without error
async function optionalAuth(req, res, next) {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
        if (req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } else {
            token = req.headers.authorization;
        }
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            req.token = token;
        } catch (err) {
            // Ignore invalid token in optional auth
        }
    }
    next();
}

module.exports = {
    authUser,
    optionalAuth
}