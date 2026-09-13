const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const redis = require("../config/cache")

async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email, and password are required"
            });
        }

        const isAlreadyRegistered = await userModel.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username }
            ]
        });

        if (isAlreadyRegistered) {
            return res.status(400).json({
                message: "User with this username or email already exists"
            });
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        // Create user
        const user = await userModel.create({
            username,
            email: email.toLowerCase(),
            password: hash
        });

        // Create token
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax"
        });

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({
            message: err.message || "Failed to register user"
        });
    }
}

async function loginUser(req, res) {
    try {
        const { email, username, password } = req.body;

        if (!password || (!email && !username)) {
            return res.status(400).json({
                message: "Email or username and password are required"
            });
        }

        const query = email ? { email: email.toLowerCase() } : { username };
        const user = await userModel.findOne(query).select("+password");

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // Create token
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax"
        });

        return res.status(200).json({
            message: "User logged in successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            message: err.message || "Failed to login user"
        });
    }
}

// Find logged-in user details
async function getMe(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            message: "User fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to fetch user profile"
        });
    }
}

async function logoutUser(req, res) {
    try {
        const token = req.token || req.cookies?.token;

        if (token && redis && redis.status === 'ready') {
            await redis.set(token, Date.now().toString(), 'EX', 7 * 24 * 60 * 60);
        }

        res.clearCookie("token");

        return res.status(200).json({
            message: "Logged out successfully"
        });
    } catch (err) {
        res.clearCookie("token");
        return res.status(200).json({
            message: "Logged out successfully"
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getMe,
    logoutUser
}