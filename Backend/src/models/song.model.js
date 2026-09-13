const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Song title is required"],
        trim: true
    },
    artist: {
        type: String,
        default: "Unknown Artist",
        trim: true
    },
    url: {
        type: String,
        required: [true, "Audio URL is required"]
    },
    postUrl: {
        type: String,
        default: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60"
    },
    posterUrl: {
        type: String,
        default: function() {
            return this.postUrl;
        }
    },
    mood: {
        type: String,
        required: [true, "Mood is required"],
        lowercase: true,
        trim: true,
        enum: {
            values: ["happy", "sad", "surprised", "angry", "neutral", "calm", "energetic", "romantic"],
            message: "Mood '{VALUE}' is not supported"
        }
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// Ensure posterUrl and postUrl are synced
songSchema.pre("save", function() {
    if (this.postUrl && !this.posterUrl) {
        this.posterUrl = this.postUrl;
    } else if (this.posterUrl && !this.postUrl) {
        this.postUrl = this.posterUrl;
    }
});

const songModel = mongoose.model("songs", songSchema)
module.exports = songModel