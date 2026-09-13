const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username must be unique"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email must be required"],
        unique: [true, "Email must be unique"],
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false
    }
}, {
    timestamps: true
})

const userModel = mongoose.model("users", userSchema);

module.exports = userModel