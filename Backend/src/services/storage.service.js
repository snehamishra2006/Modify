const ImageKit = require("@imagekit/nodejs");

let client = null;
if (process.env.IMAGEKIT_PRIVATE_KEY) {
    client = new ImageKit({
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    });
}

// Mood default cover art fallback maps
const MOOD_COVERS = {
    happy: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    sad: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    surprised: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    angry: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    neutral: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    calm: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
    energetic: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
    romantic: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&auto=format&fit=crop&q=80",
};

const DEFAULT_COVER = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";

function getDefaultPoster(mood) {
    if (!mood) return DEFAULT_COVER;
    return MOOD_COVERS[mood.toLowerCase()] || DEFAULT_COVER;
}

async function uploadFile({ buffer, filename, folder = "/modify" }) {
    if (!buffer) {
        throw new Error("No file buffer provided for upload");
    }

    // Sanitize filename
    const cleanFilename = (filename || `file_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, "_");

    if (client) {
        try {
            const file = await client.files.upload({
                file: await ImageKit.toFile(Buffer.from(buffer), cleanFilename),
                fileName: cleanFilename,
                folder
            });
            return file;
        } catch (err) {
            console.error("ImageKit upload error:", err.message);
            throw err;
        }
    } else {
        throw new Error("ImageKit client is not initialized");
    }
}

module.exports = {
    uploadFile,
    getDefaultPoster,
    MOOD_COVERS
};